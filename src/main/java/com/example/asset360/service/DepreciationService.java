package com.example.asset360.service;

import com.example.asset360.model.Asset;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Period;

@Service
public class DepreciationService {

    /**
     * Menghitung book value aset dengan metode depresiasi garis lurus.
     * Jika asOfDate sebelum purchaseDate, kembalikan nilai aset awal.
     * Jika selisih bulan lebih dari 60, gunakan 60 bulan sebagai batas depresiasi.
     * Namun, book value tidak akan turun di bawah salvage value (misalnya 5% dari nilai aset awal).
     */
    public BigDecimal calculateBookValue(Asset asset, LocalDate asOfDate) {
        // Jika tanggal perhitungan sebelum tanggal pembelian, kembalikan nilai aset awal
        if (asOfDate.isBefore(asset.getPurchaseDate())) {
            return asset.getAssetValue();
        }
        
        // Hitung selisih bulan antara purchaseDate dan asOfDate
        Period period = Period.between(asset.getPurchaseDate(), asOfDate);
        int monthsElapsed = period.getYears() * 12 + period.getMonths();
        // Batas maksimal 60 bulan
        int effectiveMonths = Math.min(monthsElapsed, 60);

        // Depresiasi per bulan = nilai aset dibagi 60
        BigDecimal monthlyDepreciation = asset.getAssetValue()
                .divide(new BigDecimal("60"), 2, RoundingMode.HALF_UP);
        // Total depresiasi
        BigDecimal totalDepreciation = monthlyDepreciation.multiply(new BigDecimal(effectiveMonths));

        // Hitung book value
        BigDecimal bookValue = asset.getAssetValue().subtract(totalDepreciation);
        
        // Tentukan salvage value minimal, misalnya 5% dari nilai aset awal
        BigDecimal salvageValue = asset.getAssetValue().multiply(new BigDecimal("0.05"));

        // Jika book value turun di bawah salvage value, tetapkan book value = salvage value
        if (bookValue.compareTo(salvageValue) < 0) {
            bookValue = salvageValue;
        }
        
        return bookValue.setScale(2, RoundingMode.HALF_UP);
    }
}
