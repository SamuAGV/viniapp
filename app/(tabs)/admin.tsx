// Este es el mismo contenido que tenías en admin.tsx
// Solo cambia la ruta de imports si es necesario
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAccessibility } from '../../src/context/AccessibilityContext';
import { useAuth } from '../../src/context/AuthContext';
import { useTalkBack } from '../../src/hooks/useTalkBack';
import { deleteUser, getAllUsers, getRecords, updateUserRole } from '../../src/storage/storage';
import { User } from '../../src/types';

export default function AdminScreen() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [userRecords, setUserRecords] = useState<{ [key: string]: number }>({});
  const { highContrast, largeText, talkBackEnabled } = useAccessibility();
  const { announceScreen, announceAction, announceSuccess, announceError } = useTalkBack({ enabled: talkBackEnabled });

  useEffect(() => {
    // Verificación adicional por si acaso
    if (!currentUser || currentUser.role !== 'admin') {
      router.replace('/(tabs)');
      return;
    }
    announceScreen('Panel de administración');
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
      
      const allRecords = await getRecords();
      const recordsCount: { [key: string]: number } = {};
      allRecords.forEach(record => {
        if (record.userId) {
          recordsCount[record.userId] = (recordsCount[record.userId] || 0) + 1;
        }
      });
      setUserRecords(recordsCount);
    } catch (error) {
      announceError('Error al cargar datos');
    }
  };

  const handleDeleteUser = (user: User) => {
    if (user.id === currentUser?.id) {
      Alert.alert('No permitido', 'No puedes eliminarte a ti mismo');
      return;
    }
    
    if (user.role === 'admin') {
      Alert.alert('No permitido', 'No puedes eliminar a otro administrador');
      return;
    }
    
    announceAction(`¿Eliminar usuario ${user.name}?`);
    Alert.alert('Eliminar usuario', `¿Estás seguro de eliminar a ${user.name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteUser(user.id);
            announceSuccess(`Usuario ${user.name} eliminado`);
            await loadData();
          } catch (error) {
            announceError('Error al eliminar usuario');
          }
        },
      },
    ]);
  };

  const handleToggleRole = async (user: User) => {
    if (user.id === currentUser?.id) {
      Alert.alert('No permitido', 'No puedes cambiar tu propio rol');
      return;
    }
    
    const newRole = user.role === 'user' ? 'admin' : 'user';
    announceAction(`Cambiar rol de ${user.name} a ${newRole}`);
    Alert.alert('Cambiar rol', `¿Dar permisos de ${newRole} a ${user.name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: async () => {
          try {
            await updateUserRole(user.id, newRole);
            announceSuccess(`Rol actualizado a ${newRole}`);
            await loadData();
          } catch (error) {
            announceError('Error al actualizar rol');
          }
        },
      },
    ]);
  };

  const textStyle = largeText ? styles.largeText : styles.normalText;
  const containerStyle = highContrast ? styles.highContrastContainer : styles.container;
  const cardStyle = highContrast ? styles.highContrastCard : styles.card;
  const textColorStyle = highContrast ? styles.highContrastText : styles.normalText;

  const renderUser = ({ item }: { item: User }) => (
    <View style={cardStyle}>
      <View style={styles.userHeader}>
        <View>
          <Text style={[styles.userName, textStyle, textColorStyle]}>{item.name}</Text>
          <Text style={[styles.userEmail, textStyle, textColorStyle]}>{item.email}</Text>
        </View>
        <View style={[styles.roleBadge, item.role === 'admin' && styles.adminBadge]}>
          <Text style={styles.roleText}>
            {item.role === 'admin' ? 'Admin' : 'User'}
          </Text>
        </View>
      </View>
      
      <View style={styles.userStats}>
        <Text style={[styles.statText, textStyle, textColorStyle]}>
          Registros: {userRecords[item.id] || 0}
        </Text>
        <Text style={[styles.statText, textStyle, textColorStyle]}>
          Desde: {new Date(item.createdAt || '').toLocaleDateString()}
        </Text>
      </View>
      
      {item.id !== currentUser?.id && (
        <View style={styles.userActions}>
          {item.role !== 'admin' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.promoteButton]}
              onPress={() => handleToggleRole(item)}
            >
              <Text style={styles.actionButtonText}>Hacer Admin</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteUser(item)}
          >
            <Text style={styles.actionButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={containerStyle}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, textStyle, textColorStyle]}>
          Panel de Administración
        </Text>
        <Text style={[styles.headerSubtitle, textStyle, textColorStyle]}>
          Gestiona usuarios y permisos
        </Text>
      </View>

      <View style={[styles.statsCard, { backgroundColor: highContrast ? '#1a1a1a' : '#3498db' }]}>
        <Text style={[styles.statsTitle, textStyle, { color: '#fff' }]}>
          Estadísticas
        </Text>
        <Text style={[styles.statsValue, { color: '#fff' }]}>
          Total de usuarios: {users.length}
        </Text>
        <Text style={[styles.statsValue, { color: '#fff' }]}>
          Administradores: {users.filter(u => u.role === 'admin').length}
        </Text>
        <Text style={[styles.statsValue, { color: '#fff' }]}>
          Usuarios normales: {users.filter(u => u.role === 'user').length}
        </Text>
      </View>

      <Text style={[styles.sectionTitle, textStyle, textColorStyle]}>
        Lista de Usuarios
      </Text>
      
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        scrollEnabled={false}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  highContrastContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  statsCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statsValue: {
    fontSize: 16,
    marginVertical: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  highContrastCard: {
    backgroundColor: '#111',
    margin: 10,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#ecf0f1',
  },
  adminBadge: {
    backgroundColor: '#f39c12',
  },
  roleText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statText: {
    fontSize: 12,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  promoteButton: {
    backgroundColor: '#27ae60',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  normalText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  largeText: {
    fontSize: 22,
  },
  highContrastText: {
    color: '#ffffff',
  },
});