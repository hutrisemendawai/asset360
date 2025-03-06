package com.example.asset360.service;

import com.example.asset360.model.Asset;
import com.example.asset360.model.AssetTransferRequest;
import com.example.asset360.model.Department;
import com.example.asset360.model.Location;
import com.example.asset360.model.TransferStatus;
import com.example.asset360.repository.AssetRepository;
import com.example.asset360.repository.AssetTransferRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.sql.Timestamp;

@Service
public class AssetTransferService {

    @Autowired
    private AssetTransferRequestRepository transferRequestRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private AssetService assetService;

    @Transactional
    public AssetTransferRequest createTransferRequest(Asset asset, Location toLocation, Department toDepartment) {
        AssetTransferRequest request = new AssetTransferRequest();
        request.setAsset(asset);
        request.setFromLocation(asset.getLocation());
        request.setToLocation(toLocation);
        request.setFromDepartment(asset.getDepartment());
        request.setToDepartment(toDepartment);
        request.setStatus(TransferStatus.PENDING);
        return transferRequestRepository.save(request);
    }

    @Transactional
    public void acceptTransferRequest(Long requestId) {
        AssetTransferRequest request = transferRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid transfer request Id:" + requestId));
        request.setStatus(TransferStatus.ACCEPTED);
        request.setRespondedAt(new Timestamp(System.currentTimeMillis()));

        Asset asset = request.getAsset();
        asset.setLocation(request.getToLocation());
        asset.setDepartment(request.getToDepartment());
        if (!request.getFromDepartment().getDepartmentId().equals(request.getToDepartment().getDepartmentId())) {
            asset.setFixedAssetCode(assetService.generateFixedAssetCode(asset));
        }
        assetRepository.save(asset);
        transferRequestRepository.save(request);
    }

    @Transactional
    public void rejectTransferRequest(Long requestId) {
        AssetTransferRequest request = transferRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid transfer request Id:" + requestId));
        request.setStatus(TransferStatus.REJECTED);
        request.setRespondedAt(new Timestamp(System.currentTimeMillis()));
        transferRequestRepository.save(request);
    }
}
