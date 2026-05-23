import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAccessibility } from '../../src/context/AccessibilityContext';
import { useAuth } from '../../src/context/AuthContext';
import { useTalkBack } from '../../src/hooks/useTalkBack';
import { getRecords } from '../../src/storage/storage';
import { Record } from '../../src/types';

export default function HomeScreen() {
  const { user } = useAuth();
  const { highContrast, largeText, talkBackEnabled } = useAccessibility();
  const { announceScreen, speak } = useTalkBack({ enabled: talkBackEnabled });
  const [records, setRecords] = useState<Record[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    recentCount: 0,
    lastWeek: 0,
    lastMonth: 0,
    mostRecent: null as Record | null,
    oldest: null as Record | null,
  });

  useEffect(() => {
    announceScreen('Pantalla de inicio. Bienvenido a la app.');
    loadRecordsAndStats();
  }, []);

  const loadRecordsAndStats = async () => {
    try {
      const allRecords = await getRecords();
      setRecords(allRecords);
      calculateStats(allRecords);
    } catch (error) {
      console.error('Error loading records:', error);
    }
  };

  const calculateStats = (allRecords: Record[]) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const lastWeekRecords = allRecords.filter(record => {
      if (!record.createdAt) return false;
      return new Date(record.createdAt) >= oneWeekAgo;
    });

    const lastMonthRecords = allRecords.filter(record => {
      if (!record.createdAt) return false;
      return new Date(record.createdAt) >= oneMonthAgo;
    });

    // Ordenar por fecha
    const sortedByDate = [...allRecords].sort((a, b) => {
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const sortedByOldest = [...allRecords].sort((a, b) => {
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    setStats({
      total: allRecords.length,
      recentCount: lastWeekRecords.length,
      lastWeek: lastWeekRecords.length,
      lastMonth: lastMonthRecords.length,
      mostRecent: sortedByDate[0] || null,
      oldest: sortedByOldest[0] || null,
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleTipPress = (tip: string) => {
    if (talkBackEnabled) {
      speak(tip);
    }
  };

  const textStyle = largeText ? styles.largeText : styles.normalText;
  const containerStyle = highContrast ? styles.highContrastContainer : styles.container;
  const cardStyle = highContrast ? styles.highContrastCard : styles.card;
  const statCardStyle = highContrast ? styles.highContrastStatCard : styles.statCard;
  const textColorStyle = highContrast ? styles.highContrastText : styles.normalText;

  return (
    <ScrollView style={containerStyle} showsVerticalScrollIndicator={false}>
      {/* Tarjeta de bienvenida */}
      <View 
        style={cardStyle}
        accessible={true}
        accessibilityLabel={`Bienvenido ${user?.name}. Esta es la pantalla principal de la aplicación.`}
        accessibilityRole="summary"
      >
        <Text style={[styles.welcome, textStyle, textColorStyle]}>
          Bienvenido 
        </Text>
        <Text style={[styles.welcome, textStyle, textColorStyle]}>
          {user?.name} 
        </Text>
        {/*<Text style={[styles.message, textStyle, textColorStyle]}>
          Esta aplicación está diseñada con principios de accesibilidad y usabilidad.
        </Text>*/}
      </View>

      {/* Sección de métricas */}
      <View style={styles.metricsSection}>
        <Text style={[styles.sectionTitle, textStyle, textColorStyle]}>
          Estadísticas de Registros
        </Text>
        
        <View style={styles.statsGrid}>
          {/* Tarjeta de total */}
          <View style={statCardStyle}>
            <Text style={[styles.statNumber, textStyle, textColorStyle]}>{stats.total}</Text>
            <Text style={[styles.statLabel, textStyle, textColorStyle]}>Total de registros</Text>
          </View>

          {/* Tarjeta de últimos 7 días */}
          <View style={statCardStyle}>
            <Text style={[styles.statNumber, textStyle, textColorStyle]}>{stats.lastWeek}</Text>
            <Text style={[styles.statLabel, textStyle, textColorStyle]}>Últimos 7 días</Text>
          </View>

          {/* Tarjeta de últimos 30 días */}
          <View style={statCardStyle}>
            <Text style={[styles.statNumber, textStyle, textColorStyle]}>{stats.lastMonth}</Text>
            <Text style={[styles.statLabel, textStyle, textColorStyle]}>Últimos 30 días</Text>
          </View>
        </View>
      </View>

      {/* Sección de fechas importantes */}
      <View style={styles.datesSection}>
        <Text style={[styles.sectionTitle, textStyle, textColorStyle]}>
        Fechas Importantes
        </Text>

        {/* Registro más reciente */}
        <TouchableOpacity 
          style={[styles.dateCard, cardStyle]}
          onPress={() => {
            if (stats.mostRecent && talkBackEnabled) {
              speak(`Registro más reciente: ${stats.mostRecent.title}, creado el ${formatDate(stats.mostRecent.createdAt)}`);
            }
          }}
          accessible={true}
          accessibilityLabel={`Registro más reciente: ${stats.mostRecent?.title || 'Ninguno'}, creado el ${formatDate(stats.mostRecent?.createdAt)}`}
          accessibilityRole="button"
        >
          <Text style={[styles.dateIcon, textStyle]}></Text>
          <View style={styles.dateContent}>
            <Text style={[styles.dateTitle, textStyle, textColorStyle]}>Registro más reciente</Text>
            {stats.mostRecent ? (
              <>
                <Text style={[styles.dateName, textStyle, textColorStyle]}>{stats.mostRecent.title}</Text>
                <Text style={[styles.dateValue, textStyle, textColorStyle]}>{formatDate(stats.mostRecent.createdAt)}</Text>
              </>
            ) : (
              <Text style={[styles.dateEmpty, textStyle, textColorStyle]}>No hay registros aún</Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Registro más antiguo */}
        <TouchableOpacity 
          style={[styles.dateCard, cardStyle]}
          onPress={() => {
            if (stats.oldest && talkBackEnabled) {
              speak(`Registro más antiguo: ${stats.oldest.title}, creado el ${formatDate(stats.oldest.createdAt)}`);
            }
          }}
          accessible={true}
          accessibilityLabel={`Registro más antiguo: ${stats.oldest?.title || 'Ninguno'}, creado el ${formatDate(stats.oldest?.createdAt)}`}
          accessibilityRole="button"
        >
          <Text style={[styles.dateIcon, textStyle]}></Text>
          <View style={styles.dateContent}>
            <Text style={[styles.dateTitle, textStyle, textColorStyle]}>Registro más antiguo</Text>
            {stats.oldest ? (
              <>
                <Text style={[styles.dateName, textStyle, textColorStyle]}>{stats.oldest.title}</Text>
                <Text style={[styles.dateValue, textStyle, textColorStyle]}>{formatDate(stats.oldest.createdAt)}</Text>
              </>
            ) : (
              <Text style={[styles.dateEmpty, textStyle, textColorStyle]}>No hay registros aún</Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Sección de acciones rápidas */}
      {/*<View style={styles.actionsSection}>
        <Text style={[styles.sectionTitle, textStyle, textColorStyle]}>
          Acciones Rápidas
        </Text>
        
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={[styles.actionCard, cardStyle]}
            onPress={() => handleTipPress('Ve a la pantalla de registros para ver todos tus registros')}
            accessible={true}
            accessibilityLabel="Ir a registros"
            accessibilityRole="button"
          >
            <Text style={[styles.actionIcon, textStyle]}></Text>
            <Text style={[styles.actionText, textStyle, textColorStyle]}>Ver registros</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, cardStyle]}
            onPress={() => handleTipPress('Ve a la pantalla de perfil para configurar la accesibilidad')}
            accessible={true}
            accessibilityLabel="Configurar accesibilidad"
            accessibilityRole="button"
          >
            <Text style={[styles.actionIcon, textStyle]}>♿</Text>
            <Text style={[styles.actionText, textStyle, textColorStyle]}>Configurar accesibilidad</Text>
          </TouchableOpacity>
        </View>
      </View>/*}

      {/* Tips de navegación */}
      <View style={[styles.tipsCard, cardStyle]}>
        <Text style={[styles.tipsTitle, textStyle, textColorStyle]}>
          Tips de navegación:
        </Text>
        <TouchableOpacity onPress={() => handleTipPress('Traza una L en la pantalla para activar o desactivar TalkBack')}>
          <Text style={[styles.tipText, textStyle, textColorStyle]}>
            • Traza una "L" en la pantalla para activar/desactivar TalkBack
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleTipPress('Desliza con dos dedos para hacer scroll')}>
          <Text style={[styles.tipText, textStyle, textColorStyle]}>
            • Desliza con dos dedos para hacer scroll
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleTipPress('Doble toque para seleccionar elementos')}>
          <Text style={[styles.tipText, textStyle, textColorStyle]}>
            • Doble toque para seleccionar elementos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleTipPress('Configura alto contraste y texto grande en el perfil')}>
          <Text style={[styles.tipText, textStyle, textColorStyle]}>
            • Configura alto contraste y texto grande en el perfil
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  highContrastContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  card: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  highContrastCard: {
    backgroundColor: '#111111',
    margin: 16,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#333333',
  },
  welcome: {
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
  },
  metricsSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  highContrastStatCard: {
    flex: 1,
    backgroundColor: '#111111',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  datesSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 16,
  },
  dateIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  dateContent: {
    flex: 1,
  },
  dateTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 12,
  },
  dateEmpty: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  actionsSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  actionsGrid: {
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  actionIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  tipsCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
  },
  tipsTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tipText: {
    marginVertical: 6,
    lineHeight: 20,
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