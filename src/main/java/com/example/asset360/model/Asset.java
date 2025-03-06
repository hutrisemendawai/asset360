package com.example.asset360.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;

@Entity
@Table(name = "assets")
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer assetId;

    @Column(nullable = false, unique = true)
    private String fixedAssetCode;

    @Column(nullable = false)
    private String assetName;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal assetValue;

    @Column(nullable = false)
    private LocalDate purchaseDate;

    @ManyToOne
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private AssetCategory category;

    @ManyToOne
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @CreationTimestamp
    private Timestamp createdAt;

    @UpdateTimestamp
    private Timestamp updatedAt;

    // Getters and Setters

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

    public BigDecimal getAssetValue() {
        return assetValue;
    }

    public void setAssetValue(BigDecimal assetValue) {
        this.assetValue = assetValue;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public Location getLocation() {
        return location;
    }

    public void setLocation(Location location) {
        this.location = location;
    }

    public AssetCategory getCategory() {
        return category;
    }

    public void setCategory(AssetCategory category) {
        this.category = category;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }
}
