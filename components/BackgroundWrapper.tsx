import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native'; 
import { LinearGradient } from 'expo-linear-gradient';

export default function BackgroundWrapper({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions(); 

  const circle1Size = width * 1.0; 
  const circle2Size = width * 0.8; 
  const circle3Size = width * 0.45; 

  return (
    <View style={styles.container} >
      <LinearGradient
        colors={['#001215', '#00252a', '#00343a', '#006873']}
        locations={[0, 0.3, 0.6, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      <LinearGradient
        colors={['transparent', 'rgba(0, 104, 115, 0.03)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.geometricContainer}>
        <View style={[styles.geometricShape, styles.shape1]} />
        <View style={[styles.geometricShape, styles.shape2]} />
      </View>
      
      <View style={[
        styles.circleBase, 
        { 
          width: circle1Size,
          height: circle1Size,
          borderRadius: circle1Size / 2,
          top: -circle1Size / 3,
          left: -circle1Size / 4
        }
      ]} />
      <View style={[
        styles.circleBase, 
        { 
          width: circle2Size,
          height: circle2Size,
          borderRadius: circle2Size / 2,
          bottom: -circle2Size / 4,
          right: -circle2Size / 5
        }
      ]} />
      <View style={[
        styles.circleBase, 
        { 
          width: circle3Size,
          height: circle3Size,
          borderRadius: circle3Size / 2,
        }
      ]} />
      
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001215',
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
  geometricContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  geometricShape: {
    position: 'absolute',
    opacity: 0.03,
    pointerEvents: 'none',
  },
  shape1: {
    width: 320,
    height: 320,
    top: '15%',
    left: '12%',
    backgroundColor: '#68f2f4',
    borderRadius: 160,
    transform: [{ rotate: '30deg' }, { skewX: '15deg' }],
  },
  shape2: {
    width: 280,
    height: 280,
    bottom: '18%',
    right: '10%',
    backgroundColor: '#006873',
    borderRadius: 140,
    transform: [{ rotate: '-15deg' }, { skewY: '10deg' }],
  },
  circleBase: {
    position: 'absolute',
    backgroundColor: '#006873',
    opacity: 0.04,
    pointerEvents: 'none',
  },
});