package com.example.asset360.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.sql.Timestamp;
import java.time.LocalDate;

@Entity
@Table(name = "asset_assignments")
public class AssetAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer assignmentId;

    @ManyToOne
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    // Assignment ke departemen (bukan ke user)
    @ManyToOne
    @JoinColumn(name = "department_id", nullable = false)
    private Department assignedDepartment;

    @Column(nullable = false)
    private LocalDate assignedDate;

    private LocalDate returnDate;

    @CreationTimestamp
    private Timestamp createdAt;

    @UpdateTimestamp
    private Timestamp updatedAt;

    // Getters dan Setters

    public Integer getAssignmentId() {
        return assignmentId;
    }

    public void setAssignmentId(Integer assignmentId) {
        this.assignmentId = assignmentId;
    }

    public Asset getAsset() {
        return asset;
    }

    public void setAsset(Asset asset) {
        this.asset = asset;
    }

    public Department getAssignedDepartment() {
        return assignedDepartment;
    }

    public void setAssignedDepartment(Department assignedDepartment) {
        this.assignedDepartment = assignedDepartment;
    }

    public LocalDate getAssignedDate() {
        return assignedDate;
    }

    public void setAssignedDate(LocalDate assignedDate) {
        this.assignedDate = assignedDate;
    }

    public LocalDate getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(LocalDate returnDate) {
        this.returnDate = returnDate;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }
}