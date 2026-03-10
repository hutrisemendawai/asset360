package com.example.asset360.controller.api;

import com.example.asset360.dto.AssetBookValueDTO;
import com.example.asset360.model.Asset;
import com.example.asset360.repository.AssetRepository;
import com.example.asset360.service.DepreciationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/book-value")
public class ApiBookValueController {

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private DepreciationService depreciationService;

    @PostMapping
    public ResponseEntity<?> calculateBookValue(@RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<Integer> assetIds = ((List<Number>) body.get("assetIds"))
                .stream().map(Number::intValue).toList();
        String asOfDateStr = (String) body.get("asOfDate");

        if (assetIds == null || assetIds.isEmpty() || asOfDateStr == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "assetIds and asOfDate are required"));
        }

        LocalDate asOfDate = LocalDate.parse(asOfDateStr);
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

        return ResponseEntity.ok(Map.of("asOfDate", asOfDate, "results", resultList));
    }
}
