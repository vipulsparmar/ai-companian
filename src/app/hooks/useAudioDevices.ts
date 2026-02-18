import { useState, useEffect, useCallback } from 'react';

export interface AudioDevice {
  deviceId: string;
  label: string;
  groupId: string;
}

export function useAudioDevices() {
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get available audio devices
  const enumerateDevices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Get all audio input devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputDevices = devices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 8)}...`,
          groupId: device.groupId,
        }));

      setDevices(audioInputDevices);
      
      // Set the first device as default if none selected
      if (audioInputDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(audioInputDevices[0].deviceId);
      }
    } catch (err) {
      console.error('Error enumerating audio devices:', err);
      setError(err instanceof Error ? err.message : 'Failed to get audio devices');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDeviceId]);

  // Get audio stream with selected device
  const getAudioStream = useCallback(async (deviceId?: string) => {
    const targetDeviceId = deviceId || selectedDeviceId;
    
    if (!targetDeviceId) {
      throw new Error('No audio device selected');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: { exact: targetDeviceId }
        }
      });
      return stream;
    } catch (err) {
      console.error('Error getting audio stream:', err);
      throw err;
    }
  }, [selectedDeviceId]);

  // Listen for device changes
  useEffect(() => {
    const handleDeviceChange = () => {
      enumerateDevices();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    
    // Initial enumeration
    enumerateDevices();

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [enumerateDevices]);

  return {
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    isLoading,
    error,
    enumerateDevices,
    getAudioStream,
  };
} 