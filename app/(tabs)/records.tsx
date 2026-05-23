import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAccessibility } from '../../src/context/AccessibilityContext';
import { useTalkBack } from '../../src/hooks/useTalkBack';
import { deleteRecord, getRecords, saveRecord, updateRecord } from '../../src/storage/storage';
import { Record } from '../../src/types';

export default function RecordsScreen() {
  const [records, setRecords] = useState<Record[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const { highContrast, largeText, talkBackEnabled } = useAccessibility();
  const { announceScreen, announceAction, announceSuccess, announceError, speak } = useTalkBack({ enabled: talkBackEnabled });

  useEffect(() => {
    announceScreen('Registros. Aquí puedes gestionar todos tus registros.');
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const data = await getRecords();
      setRecords(data);
      if (data.length === 0) {
        announceAction('No hay registros. Presiona el botón más para crear uno nuevo.');
      } else {
        announceAction(`${data.length} registros cargados`);
      }
    } catch (error) {
      announceError('Error al cargar los registros');
      console.error(error);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      const errorMsg = 'El título es obligatorio';
      announceError(errorMsg);
      Alert.alert('Error', errorMsg);
      return;
    }

    try {
      if (editingRecord) {
        await updateRecord(editingRecord.id, {
          ...editingRecord,
          title,
          description,
        });
        announceSuccess(`Registro "${title}" actualizado correctamente`);
      } else {
        const newRecord: Record = {
          id: Date.now().toString(),
          title,
          description,
          createdAt: new Date().toISOString(),
        };
        await saveRecord(newRecord);
        announceSuccess(`Registro "${title}" creado correctamente`);
      }

      setModalVisible(false);
      resetForm();
      await loadRecords();
    } catch (error) {
      announceError('Error al guardar el registro');
      console.error(error);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEditingRecord(null);
  };

  const handleEdit = (record: Record) => {
    setEditingRecord(record);
    setTitle(record.title);
    setDescription(record.description);
    setModalVisible(true);
    announceAction(`Editando registro: ${record.title}`);
  };

  const handleDelete = (id: string, title: string) => {
    announceAction(`¿Seguro que deseas eliminar el registro ${title}?`);
    Alert.alert('Eliminar', `¿Estás seguro de eliminar "${title}"?`, [
      { text: 'Cancelar', style: 'cancel', onPress: () => announceAction('Eliminación cancelada') },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRecord(id);
            announceSuccess(`Registro "${title}" eliminado`);
            await loadRecords();
          } catch (error) {
            announceError('Error al eliminar el registro');
            console.error(error);
          }
        },
      },
    ]);
  };

  const openCreateModal = () => {
    resetForm();
    setModalVisible(true);
    announceAction('Creando nuevo registro. Ingresa título y descripción.');
  };

  // Leer tarjeta al seleccionarla
  const handleCardPress = (item: Record) => {
    if (talkBackEnabled) {
      speak(`Registro: ${item.title}. Descripción: ${item.description}. Creado el ${new Date(item.createdAt || '').toLocaleDateString()}. Presiona editar para modificar, eliminar para borrar.`);
    }
  };

  const textStyle = largeText ? styles.largeText : styles.normalText;
  const containerStyle = highContrast ? styles.highContrastContainer : styles.container;
  const cardStyle = highContrast ? styles.highContrastCard : styles.card;
  const textColorStyle = highContrast ? styles.highContrastText : styles.normalText;
  const inputStyle = highContrast ? styles.highContrastInput : styles.input;
  const modalStyle = highContrast ? styles.highContrastModalContent : styles.modalContent;
  const fabStyle = highContrast ? styles.highContrastFab : styles.fab;
  const fabTextStyle = largeText ? styles.largeFabText : styles.fabText;

  const renderItem = ({ item }: { item: Record }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => handleCardPress(item)}
      onLongPress={() => handleEdit(item)}
      delayLongPress={500}
      accessible={true}
      accessibilityLabel={`Registro: ${item.title}. Descripción: ${item.description}`}
      accessibilityHint="Doble toque para editar, mantener presionado para más opciones"
      accessibilityRole="button"
    >
      <View style={cardStyle}>
        <Text style={[styles.cardTitle, textStyle, textColorStyle]}>{item.title}</Text>
        <Text style={[styles.cardDescription, textStyle, textColorStyle]}>{item.description}</Text>
        {item.createdAt && (
          <Text style={[styles.date, textStyle, textColorStyle]}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        )}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEdit(item)}
            accessibilityLabel={`Editar registro ${item.title}`}
            accessibilityRole="button"
            accessibilityHint="Abre el formulario para editar este registro"
          >
            <Text style={[styles.actionText, textStyle]}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item.id, item.title)}
            accessibilityLabel={`Eliminar registro ${item.title}`}
            accessibilityRole="button"
            accessibilityHint="Elimina este registro permanentemente"
          >
            <Text style={[styles.actionText, textStyle]}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={containerStyle}>
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <TouchableOpacity
            style={styles.emptyContainer}
            onPress={openCreateModal}
            accessible={true}
            accessibilityLabel="No hay registros. Presiona para crear tu primer registro."
            accessibilityRole="button"
          >
            <Text style={[styles.emptyText, textStyle, textColorStyle]}>No hay registros</Text>
            <Text style={[styles.emptySubtext, textStyle, textColorStyle]}>Presiona aquí para crear uno</Text>
          </TouchableOpacity>
        }
        accessibilityLabel="Lista de registros"
        accessibilityRole="none"
        contentContainerStyle={styles.listContent}
      />

      {/* Botón de crear más grande y accesible */}
      <TouchableOpacity
        style={fabStyle}
        onPress={openCreateModal}
        accessibilityLabel="Crear nuevo registro"
        accessibilityRole="button"
        accessibilityHint="Abre el formulario para crear un nuevo registro"
        activeOpacity={0.8}
      >
        <Text style={fabTextStyle}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={modalStyle}>
            <Text style={[styles.modalTitle, textStyle, textColorStyle]}>
              {editingRecord ? 'Editar Registro' : 'Nuevo Registro'}
            </Text>

            <Text style={[styles.inputLabel, textStyle, textColorStyle]}>Título *</Text>
            <TextInput
              style={inputStyle}
              placeholder="Ej: Reunión importante"
              placeholderTextColor={highContrast ? '#888888' : '#999999'}
              value={title}
              onChangeText={setTitle}
              accessibilityLabel="Campo de título"
              accessibilityHint="Ingresa el título de tu registro"
              accessibilityRole="text"
            />

            <Text style={[styles.inputLabel, textStyle, textColorStyle]}>Descripción</Text>
            <TextInput
              style={[inputStyle, styles.textArea]}
              placeholder="Ej: Reunión con el equipo a las 10am"
              placeholderTextColor={highContrast ? '#888888' : '#999999'}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              accessibilityLabel="Campo de descripción"
              accessibilityHint="Ingresa una descripción detallada"
              accessibilityRole="text"
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              accessibilityLabel="Guardar registro"
              accessibilityRole="button"
              accessibilityHint="Guarda el registro en la lista"
            >
              <Text style={[styles.buttonText, textStyle]}>Guardar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setModalVisible(false);
                resetForm();
                announceAction('Formulario cancelado');
              }}
              accessibilityLabel="Cancelar"
              accessibilityRole="button"
              accessibilityHint="Cierra el formulario sin guardar"
            >
              <Text style={[styles.cancelText, textStyle]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
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
  listContent: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#ffffff',
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
    backgroundColor: '#111111',
    margin: 10,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333333',
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: '#3498db',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  actionText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  // Botón FAB más grande y con texto
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    flexDirection: 'column',
  },
  highContrastFab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007acc',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#ffffff',
    flexDirection: 'column',
  },
  fabText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  largeFabText: {
    color: '#ffffff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  fabLabel: {
    color: '#ffffff',
    fontSize: 12,
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  highContrastModalContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#000000',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#dddddd',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#2c3e50',
  },
  highContrastInput: {
    borderWidth: 1,
    borderColor: '#555555',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#222222',
    color: '#ffffff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#27ae60',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  cancelText: {
    color: '#e74c3c',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
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