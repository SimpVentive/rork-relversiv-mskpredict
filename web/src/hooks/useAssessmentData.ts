'use client';

import { useState, useMemo, useCallback } from 'react';
import { Assessment, AssessmentCondition, SortOptions } from '@/types/assessment';
import { mockAssessments } from '@/data/mockAssessments';

interface UseAssessmentDataOptions {
  initialCondition?: 'all' | AssessmentCondition;
  initialSort?: { by: keyof Assessment; order: 'asc' | 'desc' };
}

export function useAssessmentData({
  initialCondition = 'all',
  initialSort = { by: 'assessmentDate', order: 'desc' }
}: UseAssessmentDataOptions = {}) {
  const [filterCondition, setFilterCondition] = useState<'all' | AssessmentCondition>(initialCondition);
  const [searchTerm, setSearchTerm] = useState('');
  const [anonymized, setAnonymized] = useState(false);
  const [sortBy, setSortBy] = useState<keyof Assessment>(initialSort.by);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSort.order);
  const [selectedRow, setSelectedRow] = useState<Assessment | null>(null);

  // Handle sort
  const handleSort = useCallback((column: keyof Assessment) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  }, [sortBy, sortOrder]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...mockAssessments];

    // Apply condition filter
    if (filterCondition !== 'all') {
      filtered = filtered.filter(a => a.condition === filterCondition);
    }

    // Apply search filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.patientName.toLowerCase().includes(lower) ||
        a.patientId.toLowerCase().includes(lower)
      );
    }

    // Apply sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortBy];
      let bVal: any = b[sortBy];

      // Handle tier sorting
      if (sortBy === 'clinicianTier' || sortBy === 'modelTier') {
        const tierOrder = { Green: 1, Amber: 2, Red: 3 };
        aVal = tierOrder[aVal as keyof typeof tierOrder] || 0;
        bVal = tierOrder[bVal as keyof typeof tierOrder] || 0;
      }

      // Handle boolean sorting
      if (typeof aVal === 'boolean') {
        aVal = aVal ? 1 : 0;
        bVal = bVal ? 1 : 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [filterCondition, searchTerm, sortBy, sortOrder]);

  return {
    data: filteredAndSortedData,
    totalCount: mockAssessments.length,
    filteredCount: filteredAndSortedData.length,
    filterCondition,
    setFilterCondition,
    searchTerm,
    setSearchTerm,
    anonymized,
    setAnonymized,
    sortBy,
    sortOrder,
    handleSort,
    selectedRow,
    setSelectedRow
  };
}
