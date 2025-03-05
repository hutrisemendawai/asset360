package com.example.asset360.util;

import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;

@Component("currencyFormatter")
public class CurrencyFormatter {

    public String formatRupiah(BigDecimal value) {
        if (value == null) return "";
        NumberFormat formatter = NumberFormat.getCurrencyInstance(Locale.forLanguageTag("id-ID"));
        return formatter.format(value);
    }
}
