package com.example.asset360.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class AssetBookValueDTO {
    private Integer assetId;
    private String fixedAssetCode;
    private String assetName;
    private BigDecimal originalValue;
    private BigDecimal bookValue;
    private LocalDate purchaseDate;

    public AssetBookValueDTO() {
    }

    public AssetBookValueDTO(Integer assetId, String fixedAssetCode, String assetName, BigDecimal originalValue, BigDecimal bookValue, LocalDate purchaseDate) {
        this.assetId = assetId;
        this.fixedAssetCode = fixedAssetCode;
        this.assetName = assetName;
        this.originalValue = originalValue;
        this.bookValue = bookValue;
        this.purchaseDate = purchaseDate;
    }

    public Integer getAssetId() {
        return assetId;
    }

    public void setAssetId(Integer assetId) {
        this.assetId = assetId;
    }

    public String getFixedAssetCode() {
        return fixedAssetCode;
    }

    public void setFixedAssetCode(String fixedAssetCode) {
        this.fixedAssetCode = fixedAssetCode;
    }

    public String getAssetName() {
        return assetName;
    }

    public void setAssetName(String assetName) {
        this.assetName = assetName;
    }

    public BigDecimal getOriginalValue() {
        return originalValue;
    }

    public void setOriginalValue(BigDecimal originalValue) {
        this.originalValue = originalValue;
    }

    public BigDecimal getBookValue() {
        return bookValue;
    }

    public void setBookValue(BigDecimal bookValue) {
        this.bookValue = bookValue;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }
}
