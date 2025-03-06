package com.example.asset360.util;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.client.j2se.MatrixToImageWriter;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

public class QRCodeGenerator {

    /**
     * Menghasilkan QR code dalam bentuk byte array (format PNG).
     *
     * @param text  Data yang akan di-encode ke QR code
     * @param width Lebar gambar
     * @param height Tinggi gambar
     * @return Byte array berisi data PNG QR code
     * @throws WriterException jika terjadi kesalahan saat encoding
     * @throws IOException jika terjadi kesalahan pada stream output
     */
    public static byte[] generateQRCodeImageBytes(String text, int width, int height) throws WriterException, IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);
        
        try (ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream()) {
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            return pngOutputStream.toByteArray();
        }
    }
}
