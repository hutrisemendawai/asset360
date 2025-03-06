package com.example.asset360.controller;

import com.example.asset360.util.QRCodeGenerator;
import com.google.zxing.WriterException;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
public class QRCodeController {

    /**
     * Endpoint untuk generate atau regenerate QR code.
     * Contoh: GET /qrcode?data=HelloWorld
     * akan menghasilkan QR code dalam format PNG yang meng-encode data "HelloWorld".
     */
    @GetMapping(value = "/qrcode", produces = MediaType.IMAGE_PNG_VALUE)
    public @ResponseBody byte[] getQRCode(@RequestParam("data") String data) throws WriterException, IOException {
        // Jika data kosong, gunakan default "No usable data"
        if (data == null || data.trim().isEmpty()) {
            data = "No usable data";
        }
        // Ukuran QR code: 250x250, bisa disesuaikan
        return QRCodeGenerator.generateQRCodeImageBytes(data, 250, 250);
    }
}
