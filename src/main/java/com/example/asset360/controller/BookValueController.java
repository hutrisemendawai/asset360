package com.example.asset360.controller;

import com.example.asset360.dto.AssetBookValueDTO;
import com.example.asset360.model.Asset;
import com.example.asset360.repository.AssetRepository;
import com.example.asset360.service.DepreciationService;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.text.NumberFormat;
import java.util.Locale;

@Controller
@RequestMapping("/book_value")
public class BookValueController {

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private DepreciationService depreciationService;

    // Menampilkan form pemilihan aset dan tanggal
    @GetMapping
    public String showBookValueForm(Model model) {
        List<Asset> assets = assetRepository.findAll();
        model.addAttribute("assets", assets);
        return "book_value";
    }

    // Memproses perhitungan book value dan menampilkan hasilnya
    @PostMapping
    public String calculateBookValue(@RequestParam("assetIds") List<Integer> assetIds,
                                     @RequestParam("asOfDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate,
                                     Model model) {
        List<AssetBookValueDTO> resultList = new ArrayList<>();
        for (Integer assetId : assetIds) {
            Optional<Asset> assetOpt = assetRepository.findById(assetId);
            if (assetOpt.isPresent()) {
                Asset asset = assetOpt.get();
                BigDecimal bookValue = depreciationService.calculateBookValue(asset, asOfDate);
                AssetBookValueDTO dto = new AssetBookValueDTO(
                        asset.getAssetId(),
                        asset.getFixedAssetCode(),
                        asset.getAssetName(),
                        asset.getAssetValue(),
                        bookValue,
                        asset.getPurchaseDate()
                );
                resultList.add(dto);
            }
        }
        model.addAttribute("resultList", resultList);
        model.addAttribute("asOfDate", asOfDate);
        return "book_value_result";
    }

    // Mengekspor hasil perhitungan ke PDF dengan format Rupiah dan total book value
    @PostMapping("/export")
    public void exportBookValueToPDF(@RequestParam("assetIds") List<Integer> assetIds,
                                    @RequestParam("asOfDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate,
                                    HttpServletResponse response) throws DocumentException, IOException {

        response.setContentType("application/pdf");
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=book_value_report.pdf";
        response.setHeader(headerKey, headerValue);

        List<AssetBookValueDTO> resultList = new ArrayList<>();
        for (Integer assetId : assetIds) {
            Optional<Asset> assetOpt = assetRepository.findById(assetId);
            if (assetOpt.isPresent()) {
                Asset asset = assetOpt.get();
                BigDecimal bookValue = depreciationService.calculateBookValue(asset, asOfDate);
                AssetBookValueDTO dto = new AssetBookValueDTO(
                        asset.getAssetId(),
                        asset.getFixedAssetCode(),
                        asset.getAssetName(),
                        asset.getAssetValue(),
                        bookValue,
                        asset.getPurchaseDate()
                );
                resultList.add(dto);
            }
        }

        // Menggunakan NumberFormat untuk memformat angka ke dalam format Rupiah
        NumberFormat formatter = NumberFormat.getCurrencyInstance(Locale.forLanguageTag("id-ID"));

        Document document = new Document();
        PdfWriter.getInstance(document, response.getOutputStream());
        document.open();
        document.add(new Paragraph("Laporan Book Value Aset per Tanggal " + asOfDate));
        document.add(new Paragraph(" "));

        // Variabel untuk menghitung total book value
        BigDecimal totalBookValue = BigDecimal.ZERO;

        for (AssetBookValueDTO dto : resultList) {
            totalBookValue = totalBookValue.add(dto.getBookValue());
            String line = "Aset: " + dto.getFixedAssetCode() + " - " + dto.getAssetName() +
                    " | Nilai Asli: " + formatter.format(dto.getOriginalValue()) +
                    " | Book Value: " + formatter.format(dto.getBookValue()) +
                    " | Tanggal Beli: " + dto.getPurchaseDate();
            document.add(new Paragraph(line));
        }

        document.add(new Paragraph(" "));
        document.add(new Paragraph("Total Book Value: " + formatter.format(totalBookValue)));
        document.close();
    }
}
