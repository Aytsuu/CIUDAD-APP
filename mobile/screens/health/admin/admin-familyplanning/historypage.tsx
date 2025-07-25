// // PatientHistoryScreen.js
// import React, { useState, useEffect } from 'react';
// import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import Checkbox from 'expo-checkbox'; // Using expo-checkbox for simplicity
// import { getFPRecordsForPatient, getFPCompleteRecord } from './mockApi'; // Mock API import

// const PatientHistoryScreen = () => {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { patientId, patientName } = route.params;

//   const [fpRecords, setFpRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedRecords, setSelectedRecords] = useState([]); // Stores full detailed records

//   useEffect(() => {
//     fetchPatientRecords();
//   }, [patientId]);

//   const fetchPatientRecords = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await getFPRecordsForPatient(patientId);
//       // Map the data to include a 'selected' state for checkboxes
//       setFpRecords(data.map(record => ({ ...record, isSelected: false })));
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCheckboxChange = async (recordId, isChecked) => {
//     // Update the local state of checkboxes
//     setFpRecords(prevRecords =>
//       prevRecords.map(rec =>
//         rec.fprecord_id === recordId ? { ...rec, isSelected: isChecked } : rec
//       )
//     );

//     if (isChecked) {
//       if (selectedRecords.length < 2) {
//         try {
//           const fullRecord = await getFPCompleteRecord(recordId);
//           setSelectedRecords(prev => [...prev, fullRecord]);
//         } catch (err) {
//           Alert.alert("Error", "Failed to load full record for comparison: " + err.message);
//           console.error("Error fetching full record:", err);
//           // Uncheck if loading fails
//           setFpRecords(prevRecords =>
//             prevRecords.map(rec =>
//               rec.fprecord_id === recordId ? { ...rec, isSelected: false } : rec
//             )
//           );
//         }
//       } else {
//         Alert.alert("Limit Reached", "You can select up to 2 records for comparison.");
//         // If already 2 selected, prevent selecting more and uncheck the current one
//         setFpRecords(prevRecords =>
//           prevRecords.map(rec =>
//             rec.fprecord_id === recordId ? { ...rec, isSelected: false } : rec
//           )
//         );
//       }
//     } else {
//       setSelectedRecords(prev => prev.filter(rec => rec.fprecord_id !== recordId));
//     }
//   };

//   const handleCompareClick = () => {
//     if (selectedRecords.length === 2) {
//       navigation.navigate('RecordComparison', { records: selectedRecords });
//       // Clear selection after navigating for comparison
//       setSelectedRecords([]);
//       setFpRecords(prevRecords => prevRecords.map(rec => ({ ...rec, isSelected: false })));
//     } else {
//       Alert.alert("Selection Required", "Please select exactly two records to compare.");
//     }
//   };

//   const renderItem = ({ item }) => (
//     <View style={styles.recordItem}>
//       <Checkbox
//         style={styles.checkbox}
//         value={item.isSelected}
//         onValueChange={(newValue) => handleCheckboxChange(item.fprecord_id, newValue)}
//       />
//       <TouchableOpacity
//         style={styles.recordDetails}
//         onPress={() => navigation.navigate('RecordDetail', { fprecordId: item.fprecord_id })}
//       >
//         <Text style={styles.recordIdText}>Record ID: {item.fprecord_id}</Text>
//         <Text style={styles.recordDate}>Date of Visit: {new Date(item.date_of_visit).toLocaleDateString()}</Text>
//         <Text style={styles.recordMethod}>Method Used: {item.method_used || 'N/A'}</Text>
//       </TouchableOpacity>
//       <TouchableOpacity
//         style={styles.viewButton}
//         onPress={() => navigation.navigate('RecordDetail', { fprecordId: item.fprecord_id })}
//       >
//         <Text style={styles.viewButtonText}>View</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color="#007bff" />
//         <Text style={styles.loadingText}>Loading patient history...</Text>
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.centered}>
//         <Text style={styles.errorText}>Error: {error}</Text>
//         <TouchableOpacity style={styles.retryButton} onPress={fetchPatientRecords}>
//           <Text style={styles.retryButtonText}>Retry</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//         <Text style={styles.backButtonText}>← Back to All Patients</Text>
//       </TouchableOpacity>

//       <Text style={styles.header}>Family Planning History for {patientName}</Text>

//       <TouchableOpacity
//         style={[styles.compareButton, selectedRecords.length !== 2 && styles.compareButtonDisabled]}
//         onPress={handleCompareClick}
//         disabled={selectedRecords.length !== 2}
//       >
//         <Text style={styles.compareButtonText}>Compare Selected Records</Text>
//       </TouchableOpacity>

//       {fpRecords.length === 0 ? (
//         <Text style={styles.noRecordsText}>No family planning records found for this patient.</Text>
//       ) : (
//         <FlatList
//           data={fpRecords}
//           renderItem={renderItem}
//           keyExtractor={(item) => item.fprecord_id.toString()}
//           contentContainerStyle={styles.listContent}
//         />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: '#f8f8f8',
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f8f8f8',
//   },
//   backButton: {
//     alignSelf: 'flex-start',
//     marginBottom: 15,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 8,
//     backgroundColor: '#e0e0e0',
//   },
//   backButtonText: {
//     color: '#333',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   header: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 20,
//   },
//   compareButton: {
//     backgroundColor: '#007bff',
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   compareButtonDisabled: {
//     backgroundColor: '#a0c8f9',
//   },
//   compareButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   listContent: {
//     paddingBottom: 20,
//   },
//   recordItem: {
//     flexDirection: 'row',
//     backgroundColor: '#fff',
//     padding: 15,
//     borderRadius: 10,
//     marginBottom: 10,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   checkbox: {
//     marginRight: 15,
//     width: 20,
//     height: 20,
//     borderRadius: 4,
//     borderWidth: 1,
//     borderColor: '#007bff',
//   },
//   recordDetails: {
//     flex: 1,
//   },
//   recordIdText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//   },
//   recordDate: {
//     fontSize: 14,
//     color: '#666',
//     marginTop: 4,
//   },
//   recordMethod: {
//     fontSize: 14,
//     color: '#666',
//     marginTop: 4,
//   },
//   viewButton: {
//     backgroundColor: '#e0f2f7',
//     paddingVertical: 8,
//     paddingHorizontal: 15,
//     borderRadius: 8,
//   },
//   viewButtonText: {
//     color: '#007bff',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#555',
//   },
//   errorText: {
//     fontSize: 16,
//     color: 'red',
//     textAlign: 'center',
//     marginBottom: 10,
//   },
//   retryButton: {
//     backgroundColor: '#007bff',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//   },
//   retryButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   noRecordsText: {
//     textAlign: 'center',
//     paddingVertical: 50,
//     fontSize: 16,
//     color: '#888',
//   },
// });

// export default PatientHistoryScreen;
