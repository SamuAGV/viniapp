import AsyncStorage from '@react-native-async-storage/async-storage';
import { Record, User } from '../types';

const USERS_KEY = '@app_users';
const CURRENT_USER_KEY = '@app_current_user';
const RECORDS_KEY = '@app_records';

// Usuarios por defecto
export const initDefaultUsers = async (): Promise<void> => {
  const users = await getUsers();
  if (!users || users.length === 0) {
    const defaultUsers: User[] = [
      { id: '1', email: 'admin@test.com', password: '123456', name: 'Admin' },
      { id: '2', email: 'user@test.com', password: '123456', name: 'Usuario Demo' },
    ];
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }
};

export const getUsers = async (): Promise<User[]> => {
  const data = await AsyncStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveUser = async (user: User): Promise<void> => {
  const users = await getUsers();
  users.push(user);
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  const users = await getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  }
  return null;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const data = await AsyncStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const logoutUser = async (): Promise<void> => {
  await AsyncStorage.removeItem(CURRENT_USER_KEY);
};

export const getRecords = async (): Promise<Record[]> => {
  const data = await AsyncStorage.getItem(RECORDS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveRecord = async (record: Record): Promise<void> => {
  const records = await getRecords();
  records.push(record);
  await AsyncStorage.setItem(RECORDS_KEY, JSON.stringify(records));
};

export const updateRecord = async (id: string, updatedRecord: Record): Promise<void> => {
  let records = await getRecords();
  records = records.map(rec => rec.id === id ? updatedRecord : rec);
  await AsyncStorage.setItem(RECORDS_KEY, JSON.stringify(records));
};

export const deleteRecord = async (id: string): Promise<void> => {
  let records = await getRecords();
  records = records.filter(rec => rec.id !== id);
  await AsyncStorage.setItem(RECORDS_KEY, JSON.stringify(records));
};