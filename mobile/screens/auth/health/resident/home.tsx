import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Main App Component
const HealthcareApp = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Image source={require('./assets/icons/back-arrow.png')} style={styles.backIcon} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.notificationButton}>
          <Image source={require('./assets/icons/notification.png')} style={styles.notificationIcon} />
        </TouchableOpacity>
      </View>
      
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeTextContainer}>
          <Text style={styles.welcomeTitle}>Welcome!</Text>
          <Text style={styles.welcomeSubtitle}>How can we help you today?</Text>
        </View>
        
        <View style={styles.doctorImageContainer}>
          <Image 
            source={require('./assets/images/doctor.png')} 
            style={styles.doctorImage} 
            resizeMode="contain"
          />
        </View>
      </View>
      
      {/* Main Content */}
      <ScrollView style={styles.scrollView}>
        {/* Featured Services */}
        <View style={styles.featuredCardsContainer}>
          <TouchableOpacity style={styles.featuredCard}>
            <View style={styles.featuredCardContent}>
              <Text style={styles.featuredCardTitle}>Family Planning</Text>
              <Text style={styles.featuredCardSubtitle}>Your Family, Your Future</Text>
              <Text style={styles.featuredCardSubtitle}>Plan It Right.</Text>
              
              <TouchableOpacity style={styles.learnMoreButton}>
                <Text style={styles.learnMoreText}>Learn more</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.featuredCard}>
            <View style={styles.featuredCardContent}>
              <Text style={styles.featuredCardTitle}>Animal</Text>
              <Text style={styles.featuredCardSubtitle}>Lorem Ipsum</Text>
              <Text style={styles.featuredCardSubtitle}>Lorem Ipsum</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Quick Action Services */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.quickActionItem}>
            <View style={styles.quickActionIconContainer}>
              <Image 
                source={require('./assets/icons/medicine.png')} 
                style={styles.quickActionIcon} 
              />
            </View>
            <Text style={styles.quickActionText}>Medicine Request</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionItem}>
            <View style={styles.quickActionIconContainer}>
              <Image 
                source={require('./assets/icons/records.png')} 
                style={styles.quickActionIcon} 
              />
            </View>
            <Text style={styles.quickActionText}>My Records</Text>
          </TouchableOpacity>
        </View>
        
        {/* Appointment Section */}
        <View style={styles.appointmentSection}>
          <Text style={styles.sectionTitle}>Book Appointment</Text>
          <TouchableOpacity style={styles.appointmentLink}>
            <Text style={styles.appointmentLinkText}>My appointments</Text>
          </TouchableOpacity>
        </View>
        
        {/* Service Categories */}
        <View style={styles.serviceCategories}>
          <TouchableOpacity style={[styles.serviceCard, styles.maternalCard]}>
            <Image 
              source={require('./assets/icons/maternal.png')} 
              style={styles.serviceIcon} 
            />
            <Text style={styles.serviceTitle}>Maternal</Text>
            <Text style={styles.serviceSubtitle}>Services</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.serviceCard, styles.consultationCard]}>
            <Image 
              source={require('./assets/icons/doctor-consultation.png')} 
              style={styles.serviceIcon} 
            />
            <Text style={styles.serviceTitle}>Medical</Text>
            <Text style={styles.serviceSubtitle}>Consultation</Text>
          </TouchableOpacity>
        </View>
        
        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#1e3a8a',
    height: 50,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  notificationButton: {
    padding: 8,
  },
  notificationIcon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#1e3a8a',
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  doctorImageContainer: {
    width: 120,
    height: 120,
  },
  doctorImage: {
    width: '100%',
    height: '100%',
  },
  scrollView: {
    flex: 1,
  },
  featuredCardsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginTop: 16,
  },
  featuredCard: {
    flex: 1,
    height: 150,
    margin: 4,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featuredCardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  featuredCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  featuredCardSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  learnMoreButton: {
    backgroundColor: '#22c55e',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  learnMoreText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 24,
  },
  quickActionItem: {
    width: '48%',
    backgroundColor: '#e0e7ff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    tintColor: '#1e40af',
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#1e3a8a',
    textAlign: 'center',
  },
  appointmentSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
  },
  appointmentLink: {
    padding: 4,
  },
  appointmentLinkText: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '500',
  },
  serviceCategories: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  serviceCard: {
    width: '48%',
    height: 150,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  maternalCard: {
    backgroundColor: '#a7f3d0',
  },
  consultationCard: {
    backgroundColor: '#fecdd3',
  },
  serviceIcon: {
    width: 48,
    height: 48,
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
    textAlign: 'center',
  },
  serviceSubtitle: {
    fontSize: 14,
    color: '#334155',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 24,
  },
});

export default HealthcareApp;