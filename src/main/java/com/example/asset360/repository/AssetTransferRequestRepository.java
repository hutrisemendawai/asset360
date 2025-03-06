package com.example.asset360.repository;

import com.example.asset360.model.AssetTransferRequest;
import com.example.asset360.model.TransferStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AssetTransferRequestRepository extends JpaRepository<AssetTransferRequest, Long> {
    List<AssetTransferRequest> findByStatus(TransferStatus status);
}
