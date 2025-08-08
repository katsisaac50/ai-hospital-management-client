import axios from 'axios';
import { Service, ServiceFilterParams, PaginatedServices } from '../types/service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const fetchServices = async (params?: ServiceFilterParams): Promise<PaginatedServices> => {
  try {
    const response = await axios.get(`${API_URL}/services/search`, {
      params,
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

export const createService = async (serviceData: Omit<Service, 'id' | 'createdAt' | 'isActive'>) => {
  try {
    const response = await axios.post(`${API_URL}/services`, serviceData, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};

export const updateService = async (id: string, updateData: Partial<Service>) => {
  try {
    const response = await axios.put(`${API_URL}/services/${id}`, updateData, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
};

export const deactivateService = async (id: string) => {
  try {
    const response = await axios.delete(`${API_URL}/services/${id}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error deactivating service:', error);
    throw error;
  }
};