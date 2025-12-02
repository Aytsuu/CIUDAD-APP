from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from ..models import (
    NonCommunicableDisease,
    TBsurveilance,
    SurveyIdentification,
    WaterSupply,
    SanitaryFacility,
    SolidWasteMgmt
)
from ..serializers.history_serializers import (
    NCDHistorySerializer,
    TBHistorySerializer,
    SurveyHistorySerializer,
    WaterSupplyHistorySerializer,
    SanitaryFacilityHistorySerializer,
    SolidWasteMgmtHistorySerializer
)
import logging

logger = logging.getLogger(__name__)


class NCDHistoryView(APIView):
    """Get NCD update history by ncd_id"""
    permission_classes = [AllowAny]
    
    def get(self, request, *args, **kwargs):
        ncd_id = request.query_params.get('ncd_id', None)
        
        if not ncd_id:
            return Response({
                'success': False,
                'message': 'ncd_id parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Verify the NCD record exists
            ncd = get_object_or_404(NonCommunicableDisease, ncd_id=ncd_id)
            
            # Get history for this NCD record
            history = NonCommunicableDisease.history.filter(ncd_id=ncd_id).order_by('-history_date')
            
            serializer = NCDHistorySerializer(history, many=True)
            
            return Response({
                'success': True,
                'message': 'NCD history retrieved successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error retrieving NCD history: {str(e)}")
            return Response({
                'success': False,
                'message': f'Error retrieving NCD history: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TBHistoryView(APIView):
    """Get TB Surveillance update history by tb_id"""
    permission_classes = [AllowAny]
    
    def get(self, request, *args, **kwargs):
        tb_id = request.query_params.get('tb_id', None)
        
        if not tb_id:
            return Response({
                'success': False,
                'message': 'tb_id parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Verify the TB record exists
            tb = get_object_or_404(TBsurveilance, tb_id=tb_id)
            
            # Get history for this TB record
            history = TBsurveilance.history.filter(tb_id=tb_id).order_by('-history_date')
            
            serializer = TBHistorySerializer(history, many=True)
            
            return Response({
                'success': True,
                'message': 'TB history retrieved successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error retrieving TB history: {str(e)}")
            return Response({
                'success': False,
                'message': f'Error retrieving TB history: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SurveyHistoryView(APIView):
    """Get Survey Identification update history by si_id"""
    permission_classes = [AllowAny]
    
    def get(self, request, *args, **kwargs):
        si_id = request.query_params.get('si_id', None)
        
        if not si_id:
            return Response({
                'success': False,
                'message': 'si_id parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Verify the Survey record exists
            survey = get_object_or_404(SurveyIdentification, si_id=si_id)
            
            # Get history for this Survey record
            history = SurveyIdentification.history.filter(si_id=si_id).order_by('-history_date')
            
            serializer = SurveyHistorySerializer(history, many=True)
            
            return Response({
                'success': True,
                'message': 'Survey history retrieved successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error retrieving Survey history: {str(e)}")
            return Response({
                'success': False,
                'message': f'Error retrieving Survey history: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class WaterSupplyHistoryView(APIView):
    """Get Water Supply update history by water_sup_id"""
    permission_classes = [AllowAny]
    
    def get(self, request, *args, **kwargs):
        water_sup_id = request.query_params.get('water_sup_id', None)
        
        if not water_sup_id:
            return Response({
                'success': False,
                'message': 'water_sup_id parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Verify the Water Supply record exists
            water_supply = get_object_or_404(WaterSupply, water_sup_id=water_sup_id)
            
            # Get history for this Water Supply record
            history = WaterSupply.history.filter(water_sup_id=water_sup_id).order_by('-history_date')
            
            serializer = WaterSupplyHistorySerializer(history, many=True)
            
            return Response({
                'success': True,
                'message': 'Water Supply history retrieved successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error retrieving Water Supply history: {str(e)}")
            return Response({
                'success': False,
                'message': f'Error retrieving Water Supply history: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SanitaryFacilityHistoryView(APIView):
    """Get Sanitary Facility update history by sf_id"""
    permission_classes = [AllowAny]
    
    def get(self, request, *args, **kwargs):
        sf_id = request.query_params.get('sf_id', None)
        
        if not sf_id:
            return Response({
                'success': False,
                'message': 'sf_id parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Verify the Sanitary Facility record exists
            sanitary_facility = get_object_or_404(SanitaryFacility, sf_id=sf_id)
            
            # Get history for this Sanitary Facility record
            history = SanitaryFacility.history.filter(sf_id=sf_id).order_by('-history_date')
            
            serializer = SanitaryFacilityHistorySerializer(history, many=True)
            
            return Response({
                'success': True,
                'message': 'Sanitary Facility history retrieved successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error retrieving Sanitary Facility history: {str(e)}")
            return Response({
                'success': False,
                'message': f'Error retrieving Sanitary Facility history: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SolidWasteMgmtHistoryView(APIView):
    """Get Solid Waste Management update history by swm_id"""
    permission_classes = [AllowAny]
    
    def get(self, request, *args, **kwargs):
        swm_id = request.query_params.get('swm_id', None)
        
        if not swm_id:
            return Response({
                'success': False,
                'message': 'swm_id parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Verify the Solid Waste Management record exists
            solid_waste = get_object_or_404(SolidWasteMgmt, swm_id=swm_id)
            
            # Get history for this Solid Waste Management record
            history = SolidWasteMgmt.history.filter(swm_id=swm_id).order_by('-history_date')
            
            serializer = SolidWasteMgmtHistorySerializer(history, many=True)
            
            return Response({
                'success': True,
                'message': 'Solid Waste Management history retrieved successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error retrieving Solid Waste Management history: {str(e)}")
            return Response({
                'success': False,
                'message': f'Error retrieving Solid Waste Management history: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EnvironmentalHealthHistoryView(APIView):
    """Get all environmental health history for a household (Water Supply, Sanitary Facility, Solid Waste Management)"""
    permission_classes = [AllowAny]
    
    def get(self, request, *args, **kwargs):
        hh_id = request.query_params.get('hh_id', None)
        
        if not hh_id:
            return Response({
                'success': False,
                'message': 'hh_id parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get all environmental health records for this household
            water_supply_history = []
            sanitary_facility_history = []
            solid_waste_history = []
            
            # Water Supply
            water_supply = WaterSupply.objects.filter(hh_id=hh_id).first()
            if water_supply:
                history = WaterSupply.history.filter(water_sup_id=water_supply.water_sup_id).order_by('-history_date')
                water_supply_history = WaterSupplyHistorySerializer(history, many=True).data
            
            # Sanitary Facility
            sanitary_facility = SanitaryFacility.objects.filter(hh_id=hh_id).first()
            if sanitary_facility:
                history = SanitaryFacility.history.filter(sf_id=sanitary_facility.sf_id).order_by('-history_date')
                sanitary_facility_history = SanitaryFacilityHistorySerializer(history, many=True).data
            
            # Solid Waste Management
            solid_waste = SolidWasteMgmt.objects.filter(hh_id=hh_id).first()
            if solid_waste:
                history = SolidWasteMgmt.history.filter(swm_id=solid_waste.swm_id).order_by('-history_date')
                solid_waste_history = SolidWasteMgmtHistorySerializer(history, many=True).data
            
            return Response({
                'success': True,
                'message': 'Environmental health history retrieved successfully',
                'data': {
                    'water_supply': water_supply_history,
                    'sanitary_facility': sanitary_facility_history,
                    'solid_waste_management': solid_waste_history
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error retrieving environmental health history: {str(e)}")
            return Response({
                'success': False,
                'message': f'Error retrieving environmental health history: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
