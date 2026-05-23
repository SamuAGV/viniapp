import * as SecureStore from 'expo-secure-store';
import { Record, User } from '../types';

const USERS_KEY = 'app_users';
const CURRENT_USER_KEY = 'app_current_user';
const RECORDS_KEY = 'app_records';

// Usuarios por defecto con roles
export const initDefaultUsers = async (): Promise<void> => {
  try {
    const users = await getUsers();
    if (!users || users.length === 0) {
      const defaultUsers: User[] = [
        { 
          id: '1', 
          email: 'admin@test.com', 
          password: '123456', 
          name: 'Admin Principal',
          role: 'admin',
          createdAt: new Date().toISOString()
        },
        { 
          id: '2', 
          email: 'user@test.com', 
          password: '123456', 
          name: 'Usuario Demo',
          role: 'user',
          createdAt: new Date().toISOString()
        },
      ];
      await setSecureItem(USERS_KEY, defaultUsers);
    }
  } catch (error) {
    console.error('Error initializing default users:', error);
  }
};

// Funciones auxiliares
const setSecureItem = async (key: string, value: any): Promise<void> => {
  try {
    await SecureStore.setItemAsync(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to SecureStore:', error);
  }
};

const getSecureItem = async (key: string): Promise<any> => {
  try {
    const result = await SecureStore.getItemAsync(key);
    return result ? JSON.parse(result) : null;
  } catch (error) {
    console.error('Error reading from SecureStore:', error);
    return null;
  }
};

export const getUsers = async (): Promise<User[]> => {
  const data = await getSecureItem(USERS_KEY);
  return data || [];
};

export const saveUser = async (user: User): Promise<void> => {
  try {
    const users = await getUsers();
    users.push(user);
    await setSecureItem(USERS_KEY, users);
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const users = await getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      await setSecureItem(CURRENT_USER_KEY, user);
      return user;
    }
    return null;
  } catch (error) {
    console.error('Error logging in:', error);
    return null;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  const data = await getSecureItem(CURRENT_USER_KEY);
  return data;
};

export const logoutUser = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(CURRENT_USER_KEY);
  } catch (error) {
    console.error('Error logging out:', error);
  }
};

export const getRecords = async (): Promise<Record[]> => {
  const data = await getSecureItem(RECORDS_KEY);
  return data || [];
};

export const saveRecord = async (record: Record): Promise<void> => {
  try {
    const records = await getRecords();
    records.push(record);
    await setSecureItem(RECORDS_KEY, records);
  } catch (error) {
    console.error('Error saving record:', error);
    throw error;
  }
};

export const updateRecord = async (id: string, updatedRecord: Record): Promise<void> => {
  try {
    let records = await getRecords();
    records = records.map(rec => rec.id === id ? updatedRecord : rec);
    await setSecureItem(RECORDS_KEY, records);
  } catch (error) {
    console.error('Error updating record:', error);
    throw error;
  }
};

export const deleteRecord = async (id: string): Promise<void> => {
  try {
    let records = await getRecords();
    records = records.filter(rec => rec.id !== id);
    await setSecureItem(RECORDS_KEY, records);
  } catch (error) {
    console.error('Error deleting record:', error);
    throw error;
  }
};

// Funciones específicas para admin
export const getAllUsers = async (): Promise<User[]> => {
  return await getUsers();
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    let users = await getUsers();
    users = users.filter(u => u.id !== userId);
    await setSecureItem(USERS_KEY, users);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const updateUserRole = async (userId: string, role: 'admin' | 'user'): Promise<void> => {
  try {
    let users = await getUsers();
    users = users.map(u => u.id === userId ? { ...u, role } : u);
    await setSecureItem(USERS_KEY, users);
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};