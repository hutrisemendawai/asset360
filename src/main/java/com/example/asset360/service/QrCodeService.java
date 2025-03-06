package com.example.asset360.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.common.BitMatrix;
import org.springframework.stereotype.Service;

import java.awt.image.BufferedImage;
import java.util.Hashtable;
import java.util.Map;

@Service
public class QrCodeService {

    /**
     * Menghasilkan gambar QR Code dari teks yang diberikan.
     *
     * @param text  data yang akan dikodekan ke QR Code
     * @param width  lebar gambar QR Code
     * @param height tinggi gambar QR Code
     * @return BufferedImage yang berisi QR Code
     * @throws WriterException jika terjadi kesalahan saat encoding
     */
    public BufferedImage generateQrCodeImage(String text, int width, int height) throws WriterException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        Map<EncodeHintType, Object> hints = new Hashtable<>();
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height, hints);

        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        // Set latar putih dan QR Code berwarna hitam
        for (int x = 0; x < width; x++){
            for (int y = 0; y < height; y++){
                image.setRGB(x, y, bitMatrix.get(x, y) ? 0xFF000000 : 0xFFFFFFFF);
            }
        }
        return image;
    }
}
