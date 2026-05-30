import { useEffect, useRef, useState, useCallback } from 'react'
import Hls from 'hls.js'

/**
 * VideoPlayer with watch-progress tracking.
 *
 * Props:
 *   src        – HLS (.m3u8) or mp4 URL
 *   videoId    – numeric video ID (for progress API)
 *   onProgress – callback({ videoId, watchPercent, currentTime, duration })
 *                called every ~5 seconds while playing
 */
export default function VideoPlayer({ src, videoId, onProgress }) {
    const videoRef = useRef(null)
    const hlsRef = useRef(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)
    const [watchPercent, setWatchPercent] = useState(0)

    // Track highest position reached (not just currentTime, to handle seeking back)
    const highestRef = useRef(0)
    const intervalRef = useRef(null)

    // Progress heartbeat
    const startTracking = useCallback(() => {
        // Clear any existing interval
        if (intervalRef.current) clearInterval(intervalRef.current)

        intervalRef.current = setInterval(() => {
            const video = videoRef.current
            if (!video || video.paused || !video.duration) return

            // Track highest position reached
            if (video.currentTime > highestRef.current) {
                highestRef.current = video.currentTime
            }

            const pct = Math.min(100, (highestRef.current / video.duration) * 100)
            setWatchPercent(Math.round(pct))

            if (onProgress && videoId != null) {
                onProgress({
                    videoId,
                    watchPercent: Math.round(pct * 10) / 10,
                    currentTime: video.currentTime,
                    duration: video.duration,
                })
            }
        }, 5000) // every 5 seconds
    }, [onProgress, videoId])

    // Also fire on video ended
    const handleEnded = useCallback(() => {
        const video = videoRef.current
        if (!video) return
        highestRef.current = video.duration || highestRef.current
        const pct = 100
        setWatchPercent(pct)
        if (onProgress && videoId != null) {
            onProgress({
                videoId,
                watchPercent: 100,
                currentTime: video.duration,
                duration: video.duration,
            })
        }
    }, [onProgress, videoId])

    useEffect(() => {
        const video = videoRef.current
        if (!video || !src) return

        setError(null)
        setLoading(true)
        highestRef.current = 0
        setWatchPercent(0)

        // Clean up previous HLS instance
        if (hlsRef.current) {
            hlsRef.current.destroy()
            hlsRef.current = null
        }

        const isHls = src.includes('.m3u8')
        const mp4Url = isHls ? src.replace('.m3u8', '.mp4') : src

        // Fallback: play mp4 directly
        function playDirect(url) {
            if (hlsRef.current) {
                hlsRef.current.destroy()
                hlsRef.current = null
            }
            video.src = url
            setError(null)
            setLoading(false)
        }

        // If src is not HLS (e.g. direct mp4), just set it directly
        if (!isHls) {
            playDirect(src)
            startTracking()
            return
        }

        // Safari supports HLS natively
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src
            video.addEventListener('loadeddata', () => setLoading(false), { once: true })
            video.addEventListener('error', () => playDirect(mp4Url), { once: true })
            startTracking()
            return
        }

        // Other browsers use hls.js
        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false,
                fragLoadingMaxRetry: 1,
                manifestLoadingMaxRetry: 1,
                manifestLoadingTimeOut: 5000,
            })
            hlsRef.current = hls

            hls.loadSource(src)
            hls.attachMedia(video)

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setLoading(false)
            })

            hls.on(Hls.Events.ERROR, (_event, data) => {
                if (data.fatal) {
                    console.warn('HLS failed, falling back to direct mp4:', data.type)
                    playDirect(mp4Url)
                }
            })

            startTracking()

            return () => {
                hls.destroy()
                hlsRef.current = null
                if (intervalRef.current) clearInterval(intervalRef.current)
            }
        } else {
            // Browser doesn't support HLS at all — play mp4
            playDirect(mp4Url)
            startTracking()
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [src])

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [])

    // Attach ended listener
    useEffect(() => {
        const video = videoRef.current
        if (!video) return
        video.addEventListener('ended', handleEnded)
        return () => video.removeEventListener('ended', handleEnded)
    }, [handleEnded])

    return (
        <div style={{ position: 'relative' }}>
            {loading && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    borderRadius: '8px',
                    zIndex: 1,
                    color: '#fff',
                    fontSize: '0.9rem',
                }}>
                    Loading video…
                </div>
            )}
            {error && (
                <div style={{
                    padding: '0.5rem',
                    fontSize: '0.8rem',
                    color: '#ff6b6b',
                    textAlign: 'center',
                }}>
                    {error}
                </div>
            )}
            <video
                ref={videoRef}
                controls
                controlsList="nodownload"
                disablePictureInPicture
                onContextMenu={(e) => e.preventDefault()}
                playsInline
                style={{
                    display: 'block',
                    width: '100%',
                    aspectRatio: '16 / 9',
                    backgroundColor: '#000',
                    borderRadius: '8px',
                }}
            />
            {/* Watch progress bar */}
            {videoId != null && (
                <div className="video-progress-wrap">
                    <div className="video-progress-bar">
                        <div
                            className="video-progress-fill"
                            style={{ width: `${watchPercent}%` }}
                        />
                    </div>
                    <span className="video-progress-label">
                        {watchPercent >= 90 ? '✓ Watched' : `${watchPercent}% watched`}
                    </span>
                </div>
            )}
        </div>
    )
}