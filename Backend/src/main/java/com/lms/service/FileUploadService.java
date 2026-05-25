package com.lms.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.TreeMap;

@Service
public class FileUploadService {

    private static final Logger logger = LoggerFactory.getLogger(FileUploadService.class);

    private final Cloudinary cloudinary;

    public FileUploadService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    /**
     * Generate a signature for direct frontend-to-Cloudinary signed uploads.
     * The API secret never leaves the backend.
     *
     * @param paramsToSign map of upload parameters (timestamp, folder, etc.)
     * @return the signature string
     */
    public String generateSignature(Map<String, Object> paramsToSign) {
        return cloudinary.apiSignRequest(paramsToSign, cloudinary.config.apiSecret);
    }

    public String getApiKey() {
        return cloudinary.config.apiKey;
    }

    public String getCloudName() {
        return cloudinary.config.cloudName;
    }

    /**
     * Upload a generic file (images, etc.) and return the secure URL.
     */
    public String uploadFile(MultipartFile file) {
        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "lms_uploads",
                            "resource_type", "auto"
                    )
            );

            return result.get("secure_url").toString();

        } catch (Exception e) {
            throw new RuntimeException("Upload failed: " + e.getMessage());
        }
    }

    /**
     * Upload a video to Cloudinary.
     * Returns the secure URL for direct playback.
     */
    public String uploadVideo(MultipartFile file) {
        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "lms_uploads",
                            "resource_type", "video"
                    )
            );

            String secureUrl = result.get("secure_url").toString();
            String publicId = result.get("public_id").toString();
            logger.info("Video uploaded. Public ID: {}, URL: {}", publicId, secureUrl);
            return secureUrl;

        } catch (Exception e) {
            logger.error("Video upload failed", e);
            throw new RuntimeException("Video upload failed: " + e.getMessage());
        }
    }

    /**
     * Convert a Cloudinary video URL to its HLS (m3u8) equivalent.
     * Works by simply changing the file extension — Cloudinary handles
     * on-the-fly transcoding for videos on all plans.
     */
    public String getHlsUrl(String videoUrl) {
        if (videoUrl == null) return null;
        // Replace the extension (.mp4, .mov, .webm, etc.) with .m3u8
        String hlsUrl = videoUrl.replaceAll("\\.[a-zA-Z0-9]+$", ".m3u8");
        logger.info("Generated HLS URL: {}", hlsUrl);
        return hlsUrl;
    }

    public String deleteFile(String publicId) {
        try {
            Map<?, ?> result = cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", "video"));
            return result.get("result").toString();
        } catch (Exception e) {
            throw new RuntimeException("Deletion failed: " + e.getMessage());
        }
    }
}
 