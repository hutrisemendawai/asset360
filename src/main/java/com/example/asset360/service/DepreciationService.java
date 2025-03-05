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
     * Jika tanggal yang dipilih (asOfDate) sebelum purchaseDate, maka kembalikan nilai awal aset.
     * Jika selisih bulan lebih dari 60, gunakan 60 bulan.
     */
    public BigDecimal calculateBookValue(Asset asset, LocalDate asOfDate) {
        if (asOfDate.isBefore(asset.getPurchaseDate())) {
            return asset.getAssetValue();
        }
        // Hitung jumlah bulan antara purchaseDate dan asOfDate
        Period period = Period.between(asset.getPurchaseDate(), asOfDate);
        int monthsElapsed = period.getYears() * 12 + period.getMonths();
        int effectiveMonths = Math.min(monthsElapsed, 60);

        // Depresiasi per bulan = nilai aset dibagi 60
        BigDecimal monthlyDepreciation = asset.getAssetValue()
                .divide(new BigDecimal("60"), 2, RoundingMode.HALF_UP);
        BigDecimal totalDepreciation = monthlyDepreciation.multiply(new BigDecimal(effectiveMonths));

        BigDecimal bookValue = asset.getAssetValue().subtract(totalDepreciation);
        if (bookValue.compareTo(BigDecimal.ZERO) < 0) {
            bookValue = BigDecimal.ZERO;
        }
        return bookValue.setScale(2, RoundingMode.HALF_UP);
    }
}
