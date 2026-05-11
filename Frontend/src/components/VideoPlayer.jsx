import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

export default function VideoPlayer({ src }) {
    const videoRef = useRef(null)
    const hlsRef = useRef(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const video = videoRef.current
        if (!video || !src) return

        setError(null)
        setLoading(true)

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
            return
        }

        // Safari supports HLS natively
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src
            video.addEventListener('loadeddata', () => setLoading(false), { once: true })
            video.addEventListener('error', () => playDirect(mp4Url), { once: true })
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

            return () => {
                hls.destroy()
                hlsRef.current = null
            }
        } else {
            // Browser doesn't support HLS at all — play mp4
            playDirect(mp4Url)
        }
    }, [src])

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
                playsInline
                style={{
                    display: 'block',
                    width: '100%',
                    aspectRatio: '16 / 9',
                    backgroundColor: '#000',
                    borderRadius: '8px',
                }}
            />
        </div>
    )
}