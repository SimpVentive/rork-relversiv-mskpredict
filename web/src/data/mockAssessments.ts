import { Assessment } from '@/types/assessment';

export const mockAssessments: Assessment[] = [
  {
    id: 'a1', patientId: 'p001', patientName: 'Mouli Sinha', condition: 'back', assessmentDate: '2026-05-14', age: 47, gender: 'M', hospital: 'AIG', clinicianTier: 'Amber', modelTier: 'Amber', agreement: true, rpiScore: 62, startScore: 5, romFlexion: 92.5, physioScore: 71, painIntensity: 5.8, bmi: 26.2
  },
  {
    id: 'a2', patientId: 'p002', patientName: 'Rambabu Reddy', condition: 'back', assessmentDate: '2026-05-13', age: 52, gender: 'M', hospital: 'AIG', clinicianTier: 'Green', modelTier: 'Green', agreement: true, rpiScore: 28, startScore: 2, romFlexion: 98.1, physioScore: 85, painIntensity: 3.2, bmi: 24.1
  },
  {
    id: 'a3', patientId: 'p003', patientName: 'Priya Sharma', condition: 'back', assessmentDate: '2026-05-12', age: 38, gender: 'F', hospital: 'AIG', clinicianTier: 'Red', modelTier: 'Amber', agreement: false, rpiScore: 75, startScore: 7, romFlexion: 65.3, physioScore: 45, painIntensity: 8.2, bmi: 23.8
  },
  {
    id: 'a4', patientId: 'p004', patientName: 'Vikram Patel', condition: 'back', assessmentDate: '2026-05-11', age: 55, gender: 'M', hospital: 'AIG', clinicianTier: 'Amber', modelTier: 'Amber', agreement: true, rpiScore: 58, startScore: 4, romFlexion: 88.2, physioScore: 68, painIntensity: 6.1, bmi: 27.5
  },
  {
    id: 'a5', patientId: 'p005', patientName: 'Anjali Nair', condition: 'back', assessmentDate: '2026-05-10', age: 44, gender: 'F', hospital: 'AIG', clinicianTier: 'Green', modelTier: 'Green', agreement: true, rpiScore: 32, startScore: 3, romFlexion: 95.0, physioScore: 82, painIntensity: 4.1, bmi: 22.3
  },
  {
    id: 'a6', patientId: 'p006', patientName: 'Suresh Kumar', condition: 'back', assessmentDate: '2026-05-09', age: 60, gender: 'M', hospital: 'AIG', clinicianTier: 'Red', modelTier: 'Red', agreement: true, rpiScore: 82, startScore: 8, romFlexion: 58.9, physioScore: 38, painIntensity: 9.0, bmi: 29.1
  },
  {
    id: 'a7', patientId: 'p007', patientName: 'Divya Gupta', condition: 'back', assessmentDate: '2026-05-08', age: 41, gender: 'F', hospital: 'AIG', clinicianTier: 'Amber', modelTier: 'Green', agreement: false, rpiScore: 48, startScore: 4, romFlexion: 91.2, physioScore: 75, painIntensity: 5.3, bmi: 25.0
  },
  {
    id: 'a8', patientId: 'p008', patientName: 'Rajesh Singh', condition: 'back', assessmentDate: '2026-05-07', age: 49, gender: 'M', hospital: 'AIG', clinicianTier: 'Green', modelTier: 'Amber', agreement: false, rpiScore: 42, startScore: 2, romFlexion: 96.5, physioScore: 88, painIntensity: 3.8, bmi: 26.8
  },
  {
    id: 'a9', patientId: 'p009', patientName: 'Kavya Menon', condition: 'back', assessmentDate: '2026-05-06', age: 35, gender: 'F', hospital: 'AIG', clinicianTier: 'Red', modelTier: 'Red', agreement: true, rpiScore: 78, startScore: 6, romFlexion: 72.1, physioScore: 52, painIntensity: 7.8, bmi: 24.5
  },
  {
    id: 'a10', patientId: 'p010', patientName: 'Arjun Verma', condition: 'back', assessmentDate: '2026-05-05', age: 53, gender: 'M', hospital: 'AIG', clinicianTier: 'Amber', modelTier: 'Amber', agreement: true, rpiScore: 65, startScore: 5, romFlexion: 85.4, physioScore: 66, painIntensity: 6.5, bmi: 28.2
  },
  {
    id: 'a11', patientId: 'p011', patientName: 'Sneha Joshi', condition: 'back', assessmentDate: '2026-05-04', age: 40, gender: 'F', hospital: 'AIG', clinicianTier: 'Green', modelTier: 'Green', agreement: true, rpiScore: 25, startScore: 1, romFlexion: 99.2, physioScore: 92, painIntensity: 2.1, bmi: 21.8
  },
  {
    id: 'a12', patientId: 'p012', patientName: 'Nikhil Desai', condition: 'back', assessmentDate: '2026-05-03', age: 58, gender: 'M', hospital: 'AIG', clinicianTier: 'Red', modelTier: 'Amber', agreement: false, rpiScore: 70, startScore: 7, romFlexion: 68.3, physioScore: 48, painIntensity: 8.5, bmi: 30.1
  },
  {
    id: 'a13', patientId: 'p013', patientName: 'Pooja Iyer', condition: 'back', assessmentDate: '2026-05-02', age: 36, gender: 'F', hospital: 'AIG', clinicianTier: 'Amber', modelTier: 'Amber', agreement: true, rpiScore: 55, startScore: 4, romFlexion: 89.7, physioScore: 72, painIntensity: 5.9, bmi: 23.2
  },
  {
    id: 'a14', patientId: 'p014', patientName: 'Manish Bhat', condition: 'back', assessmentDate: '2026-05-01', age: 51, gender: 'M', hospital: 'AIG', clinicianTier: 'Green', modelTier: 'Green', agreement: true, rpiScore: 30, startScore: 3, romFlexion: 94.8, physioScore: 84, painIntensity: 3.6, bmi: 25.9
  },
  {
    id: 'a15', patientId: 'p015', patientName: 'Rupali Chopra', condition: 'back', assessmentDate: '2026-04-30', age: 45, gender: 'F', hospital: 'AIG', clinicianTier: 'Red', modelTier: 'Red', agreement: true, rpiScore: 80, startScore: 8, romFlexion: 62.1, physioScore: 42, painIntensity: 8.8, bmi: 26.7
  },
  {
    id: 'a16', patientId: 'p016', patientName: 'Sanjay Kulkarni', condition: 'back', assessmentDate: '2026-04-29', age: 54, gender: 'M', hospital: 'AIG', clinicianTier: 'Amber', modelTier: 'Amber', agreement: true, rpiScore: 60, startScore: 5, romFlexion: 87.5, physioScore: 69, painIntensity: 6.2, bmi: 27.3
  },
  {
    id: 'a17', patientId: 'p017', patientName: 'Natasha Roy', condition: 'back', assessmentDate: '2026-04-28', age: 39, gender: 'F', hospital: 'AIG', clinicianTier: 'Green', modelTier: 'Amber', agreement: false, rpiScore: 38, startScore: 2, romFlexion: 97.3, physioScore: 87, painIntensity: 2.9, bmi: 22.5
  },
  {
    id: 'a18', patientId: 'p018', patientName: 'Deepak Yadav', condition: 'back', assessmentDate: '2026-04-27', age: 57, gender: 'M', hospital: 'AIG', clinicianTier: 'Red', modelTier: 'Red', agreement: true, rpiScore: 85, startScore: 9, romFlexion: 55.6, physioScore: 35, painIntensity: 9.2, bmi: 31.2
  },
  {
    id: 'a19', patientId: 'p019', patientName: 'Shreya Banerjee', condition: 'back', assessmentDate: '2026-04-26', age: 42, gender: 'F', hospital: 'AIG', clinicianTier: 'Amber', modelTier: 'Green', agreement: false, rpiScore: 45, startScore: 3, romFlexion: 92.1, physioScore: 78, painIntensity: 5.1, bmi: 24.8
  },
  {
    id: 'a20', patientId: 'p020', patientName: 'Akshay Sharma', condition: 'back', assessmentDate: '2026-04-25', age: 48, gender: 'M', hospital: 'AIG', clinicianTier: 'Green', modelTier: 'Green', agreement: true, rpiScore: 35, startScore: 1, romFlexion: 98.8, physioScore: 89, painIntensity: 2.8, bmi: 23.9
  },
  {
    id: 'a21', patientId: 'p021', patientName: 'Meera Kapoor', condition: 'back', assessmentDate: '2026-04-24', age: 46, gender: 'F', hospital: 'AIG', clinicianTier: 'Red', modelTier: 'Amber', agreement: false, rpiScore: 72, startScore: 6, romFlexion: 75.2, physioScore: 55, painIntensity: 7.5, bmi: 25.6
  },
  {
    id: 'a22', patientId: 'p022', patientName: 'Rohan Mishra', condition: 'back', assessmentDate: '2026-04-23', age: 50, gender: 'M', hospital: 'AIG', clinicianTier: 'Amber', modelTier: 'Amber', agreement: true, rpiScore: 63, startScore: 5, romFlexion: 86.9, physioScore: 70, painIntensity: 6.3, bmi: 26.5
  },
  {
    id: 'a23', patientId: 'p023', patientName: 'Ananya Das', condition: 'back', assessmentDate: '2026-04-22', age: 37, gender: 'F', hospital: 'AIG', clinicianTier: 'Green', modelTier: 'Green', agreement: true, rpiScore: 28, startScore: 2, romFlexion: 96.2, physioScore: 86, painIntensity: 3.3, bmi: 22.1
  },
  {
    id: 'a24', patientId: 'p024', patientName: 'Harsh Patel', condition: 'back', assessmentDate: '2026-04-21', age: 56, gender: 'M', hospital: 'AIG', clinicianTier: 'Red', modelTier: 'Red', agreement: true, rpiScore: 83, startScore: 8, romFlexion: 60.4, physioScore: 40, painIntensity: 8.9, bmi: 29.8
  },
  {
    id: 'a25', patientId: 'p025', patientName: 'Swati Saxena', condition: 'back', assessmentDate: '2026-04-20', age: 43, gender: 'F', hospital: 'AIG', clinicianTier: 'Amber', modelTier: 'Amber', agreement: true, rpiScore: 58, startScore: 4, romFlexion: 90.5, physioScore: 73, painIntensity: 5.7, bmi: 24.3
  },
  {
    id: 'a26', patientId: 'p026', patientName: 'Vishal Jain', condition: 'back', assessmentDate: '2026-04-19', age: 52, gender: 'M', hospital: 'AIG', clinicianTier: 'Green', modelTier: 'Green', agreement: true, rpiScore: 32, startScore: 3, romFlexion: 93.6, physioScore: 81, painIntensity: 4.2, bmi: 25.7
  },
  {
    id: 'a27', patientId: 'p027', patientName: 'Isha Malhotra', condition: 'back', assessmentDate: '2026-04-18', age: 34, gender: 'F', hospital: 'AIG', clinicianTier: 'Red', modelTier: 'Red', agreement: true, rpiScore: 79, startScore: 7, romFlexion: 70.8, physioScore: 50, painIntensity: 7.6, bmi: 23.4
  },
  {
    id: 'a28', patientId: 'p028', patientName: 'Rajendra Singh', condition: 'back', assessmentDate: '2026-04-17', age: 59, gender: 'M', hospital: 'AIG', clinicianTier: 'Amber', modelTier: 'Amber', agreement: true, rpiScore: 66, startScore: 5, romFlexion: 84.2, physioScore: 65, painIntensity: 6.8, bmi: 28.6
  },
  {
    id: 'a29', patientId: 'p029', patientName: 'Chandni Verma', condition: 'back', assessmentDate: '2026-04-16', age: 38, gender: 'F', hospital: 'AIG', clinicianTier: 'Green', modelTier: 'Amber', agreement: false, rpiScore: 40, startScore: 2, romFlexion: 95.8, physioScore: 85, painIntensity: 3.5, bmi: 21.9
  },
  {
    id: 'a30', patientId: 'p030', patientName: 'Siddharth Rao', condition: 'back', assessmentDate: '2026-04-15', age: 55, gender: 'M', hospital: 'AIG', clinicianTier: 'Red', modelTier: 'Red', agreement: true, rpiScore: 81, startScore: 8, romFlexion: 63.7, physioScore: 43, painIntensity: 8.4, bmi: 29.5
  },
  {
    id: 'a31', patientId: 'p031', patientName: 'Ritika Nair', condition: 'back', assessmentDate: '2026-04-14', age: 44, gender: 'F', hospital: 'AIG', clinicianTier: 'Amber', modelTier: 'Amber', agreement: true, rpiScore: 61, startScore: 5, romFlexion: 88.3, physioScore: 71, painIntensity: 6.0, bmi: 25.2
  },
  {
    id: 'a32', patientId: 'p032', patientName: 'Karthik Menon', condition: 'back', assessmentDate: '2026-04-13', age: 49, gender: 'M', hospital: 'AIG', clinicianTier: 'Green', modelTier: 'Green', agreement: true, rpiScore: 29, startScore: 2, romFlexion: 97.1, physioScore: 87, painIntensity: 3.1, bmi: 24.6
  },
  {
    id: 'a33', patientId: 'p033', patientName: 'Priyanka Singh', condition: 'back', assessmentDate: '2026-04-12', age: 41, gender: 'F', hospital: 'AIG', clinicianTier: 'Red', modelTier: 'Amber', agreement: false, rpiScore: 73, startScore: 6, romFlexion: 74.5, physioScore: 54, painIntensity: 7.3, bmi: 26.1
  },
  {
    id: 'a34', patientId: 'p034', patientName: 'Aditya Kumar', condition: 'back', assessmentDate: '2026-04-11', age: 54, gender: 'M', hospital: 'AIG', clinicianTier: 'Amber', modelTier: 'Amber', agreement: true, rpiScore: 64, startScore: 5, romFlexion: 87.6, physioScore: 68, painIntensity: 6.4, bmi: 27.8
  },
  {
    id: 'a35', patientId: 'p035', patientName: 'Neha Gupta', condition: 'back', assessmentDate: '2026-04-10', age: 36, gender: 'F', hospital: 'AIG', clinicianTier: 'Green', modelTier: 'Green', agreement: true, rpiScore: 26, startScore: 1, romFlexion: 98.5, physioScore: 91, painIntensity: 2.4, bmi: 22.8
  },
  {
    id: 'a36', patientId: 'p036', patientName: 'Vijay Reddy', condition: 'back', assessmentDate: '2026-04-09', age: 57, gender: 'M', hospital: 'AIG', clinicianTier: 'Red', modelTier: 'Red', agreement: true, rpiScore: 84, startScore: 9, romFlexion: 58.2, physioScore: 36, painIntensity: 9.1, bmi: 30.8
  },
  {
    id: 'a37', patientId: 'p037', patientName: 'Anjali Bose', condition: 'back', assessmentDate: '2026-04-08', age: 39, gender: 'F', hospital: 'AIG', clinicianTier: 'Amber', modelTier: 'Green', agreement: false, rpiScore: 47, startScore: 3, romFlexion: 91.9, physioScore: 76, painIntensity: 5.4, bmi: 23.7
  },
  {
    id: 'a38', patientId: 'p038', patientName: 'Nitin Sinha', condition: 'back', assessmentDate: '2026-04-07', age: 51, gender: 'M', hospital: 'AIG', clinicianTier: 'Green', modelTier: 'Green', agreement: true, rpiScore: 33, startScore: 3, romFlexion: 94.2, physioScore: 83, painIntensity: 3.9, bmi: 26.0
  },
  {
    id: 'a39', patientId: 'p039', patientName: 'Divyesh Desai', condition: 'back', assessmentDate: '2026-04-06', age: 47, gender: 'M', hospital: 'AIG', clinicianTier: 'Red', modelTier: 'Red', agreement: true, rpiScore: 77, startScore: 7, romFlexion: 71.3, physioScore: 51, painIntensity: 7.7, bmi: 25.9
  },
  {
    id: 'a40', patientId: 'p040', patientName: 'Sarita Patel', condition: 'back', assessmentDate: '2026-04-05', age: 45, gender: 'F', hospital: 'AIG', clinicianTier: 'Amber', modelTier: 'Amber', agreement: true, rpiScore: 59, startScore: 4, romFlexion: 89.4, physioScore: 74, painIntensity: 5.8, bmi: 24.4
  },
  {
    id: 'a41', patientId: 'p041', patientName: 'Hemant Jain', condition: 'back', assessmentDate: '2026-04-04', age: 50, gender: 'M', hospital: 'AIG', clinicianTier: 'Green', modelTier: 'Green', agreement: true, rpiScore: 31, startScore: 2, romFlexion: 95.7, physioScore: 84, painIntensity: 3.7, bmi: 25.3
  },
  {
    id: 'a42', patientId: 'p042', patientName: 'Amara Sinha', condition: 'back', assessmentDate: '2026-04-03', age: 40, gender: 'F', hospital: 'AIG', clinicianTier: 'Red', modelTier: 'Red', agreement: true, rpiScore: 76, startScore: 6, romFlexion: 73.6, physioScore: 53, painIntensity: 7.4, bmi: 25.1
  },
  {
    id: 'a43', patientId: 'p043', patientName: 'Saurabh Verma', condition: 'back', assessmentDate: '2026-04-02', age: 53, gender: 'M', hospital: 'AIG', clinicianTier: 'Amber', modelTier: 'Amber', agreement: true, rpiScore: 67, startScore: 5, romFlexion: 83.9, physioScore: 67, painIntensity: 6.5, bmi: 27.1
  }
];

export const getTotalCount = () => mockAssessments.length;
