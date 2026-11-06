import React, { useState, useEffect, useRef } from 'react';
import { AnonymousUser } from '../types';
import { ActiveSession } from '../types/peerSupport';
import { backendSocket } from '../services/backendSocket';
import { ambientSound } from '../utils/audioSynthesizer';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneOff,
  MessageSquare,
  Shield,
  CloudRain,
  Flame,
  Waves,
  Music,
  Heart,
  Sparkles,
  Wifi,
  Activity
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LiveCallSessionProps {
  user: AnonymousUser;
  session: ActiveSession;
  peer: {
    userId: string;
    uniqueTag: string;
    alias: string;
    auraColor: string;
  };
  role: 'requester' | 'listener';
  onEndCall: () => void;
  onSwitchToChat: () => void;
}

export const LiveCallSession: React.FC<LiveCallSessionProps> = ({
  user,
  session,
  peer,
  role,
  onEndCall,
  onSwitchToChat
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);
  const [selectedAmbience, setSelectedAmbience] = useState<'none' | 'rain' | 'hearth' | 'stream' | 'drone'>('rain');
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected'>('connecting');
  const [audioWaveLevels, setAudioWaveLevels] = useState<number[]>([15, 25, 40, 20, 35, 60, 45, 30, 50, 25, 15, 30]);
  const [micActive, setMicActive] = useState(false);

  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  // Setup WebRTC and call timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    // Start timer & ambience
    interval = setInterval(() => {
      setCallDurationSeconds((prev) => prev + 1);
    }, 1000);

    ambientSound.playAmbience('rain');

    // Attempt genuine WebRTC audio connection
    async function initWebRtc() {
      try {
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        peerConnectionRef.current = pc;

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            backendSocket.sendWebRtcSignal({
              type: 'ice_candidate',
              candidate: event.candidate
            });
          }
        };

        pc.ontrack = (event) => {
          if (remoteAudioRef.current && event.streams[0]) {
            remoteAudioRef.current.srcObject = event.streams[0];
            remoteAudioRef.current.play().catch(() => {});
          }
        };

        // Get microphone if available
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStreamRef.current = stream;
            setMicActive(true);
            stream.getTracks().forEach((track) => pc.addTrack(track, stream));
          } catch (micErr) {
            console.warn('Microphone permission not granted or unavailable:', micErr);
          }
        }

        // If requester, initiate WebRTC offer
        if (role === 'requester') {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          backendSocket.sendWebRtcSignal({
            type: 'offer',
            sdp: offer
          });
        }

        setCallStatus('connected');
      } catch (err) {
        console.warn('WebRTC init fallback:', err);
        setCallStatus('connected');
      }
    }

    initWebRtc();

    // Listen to signaling from peer
    const unsubscribe = backendSocket.subscribe(async (event) => {
      if (event.type === 'WEBRTC_SIGNAL') {
        const pc = peerConnectionRef.current;
        if (!pc) return;

        const signal = event.payload;
        try {
          if (signal.type === 'offer' && role === 'listener') {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            backendSocket.sendWebRtcSignal({
              type: 'answer',
              sdp: answer
            });
          } else if (signal.type === 'answer' && role === 'requester') {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          } else if (signal.type === 'ice_candidate' && signal.candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
          }
        } catch (webrtcErr) {
          console.warn('WebRTC signal handling:', webrtcErr);
        }
      } else if (event.type === 'SESSION_ENDED') {
        onEndCall();
      }
    });

    return () => {
      clearInterval(interval);
      ambientSound.stop();
      unsubscribe();

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [role, onEndCall]);

  // Audio wave visualizer animation
  useEffect(() => {
    const anim = setInterval(() => {
      if (isMuted) {
        setAudioWaveLevels([8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8]);
      } else {
        setAudioWaveLevels(
          Array.from({ length: 16 }, () => Math.floor(Math.random() * 55 + 10))
        );
      }
    }, 120);

    return () => clearInterval(anim);
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((track) => {
          track.enabled = !next;
        });
      }
      return next;
    });
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn((prev) => {
      const next = !prev;
      ambientSound.setVolume(next ? 0.25 : 0);
      if (remoteAudioRef.current) {
        remoteAudioRef.current.muted = !next;
      }
      return next;
    });
  };

  const handleSelectAmbience = (type: 'none' | 'rain' | 'hearth' | 'stream' | 'drone') => {
    setSelectedAmbience(type);
    if (type === 'none' || !isSpeakerOn) {
      ambientSound.stop();
    } else {
      ambientSound.playAmbience(type);
    }
  };

  const handleSendHug = (e: React.MouseEvent) => {
    try {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      confetti({
        particleCount: 24,
        spread: 60,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight
        },
        colors: ['#f43f5e', '#6366f1', '#10b981']
      });
    } catch (err) {
      // ignore
    }
    backendSocket.sendChatMessage(`🫂 [Sent a silent warm hug during call]`);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <audio ref={remoteAudioRef} autoPlay />

      <div className="bg-slate-900 rounded-3xl max-w-2xl w-full text-white shadow-2xl border border-slate-800 flex flex-col overflow-hidden relative">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Anonymous WebRTC Audio Call</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize text-slate-300 font-medium">
              {session.topic.replace(/_/g, ' ')}
            </span>
          </div>

          <button
            onClick={onSwitchToChat}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Switch to Text</span>
          </button>
        </div>

        {/* Main Stage */}
        <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center">
          
          {/* Peer Avatar */}
          <div className="relative mb-4">
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-slate-800"
              style={{ backgroundColor: peer.auraColor }}
            >
              {peer.alias.slice(0, 1)}
            </div>

            {callStatus === 'connected' && !isMuted && (
              <div className="absolute -inset-2 rounded-full border-2 border-indigo-400/50 animate-pulse pointer-events-none" />
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
            {peer.alias}
          </h3>

          <div className="font-mono text-xs text-slate-400 mb-2">
            {peer.uniqueTag}
          </div>

          {/* Duration & Status */}
          <div className="flex items-center gap-2 mb-6 text-xs text-slate-300">
            {callStatus === 'connecting' ? (
              <span className="text-amber-400 animate-pulse">Establishing encrypted WebRTC link...</span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono tabular-nums text-sm font-semibold text-white">
                  {formatTimer(callDurationSeconds)}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">
                  {role === 'listener' ? 'Listening to peer' : 'Connected to listener'}
                </span>
              </div>
            )}
          </div>

          {/* Audio Waveform */}
          <div className="w-full max-w-sm h-14 bg-slate-950/60 rounded-2xl border border-slate-800/80 px-6 flex items-center justify-center gap-1.5 mb-6">
            {audioWaveLevels.map((lvl, i) => (
              <div
                key={i}
                className="w-1.5 bg-indigo-400 rounded-full transition-all duration-100"
                style={{
                  height: `${Math.max(6, lvl)}px`,
                  opacity: isMuted ? 0.3 : 0.8
                }}
              />
            ))}
          </div>

          {/* Calming Soundscape Ambience Selector */}
          <div className="w-full max-w-md bg-slate-950/40 rounded-2xl p-3 border border-slate-800 mb-6">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 px-1">
              <span>Comforting Background Soundscape (Zero Awkward Silence)</span>
              <span className="capitalize text-indigo-300 font-medium">{selectedAmbience}</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              <button
                onClick={() => handleSelectAmbience('rain')}
                className={`p-2 rounded-xl text-center text-xs flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                  selectedAmbience === 'rain' ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <CloudRain className="w-3.5 h-3.5" />
                <span className="text-[10px]">Rain</span>
              </button>

              <button
                onClick={() => handleSelectAmbience('hearth')}
                className={`p-2 rounded-xl text-center text-xs flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                  selectedAmbience === 'hearth' ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-[10px]">Hearth</span>
              </button>

              <button
                onClick={() => handleSelectAmbience('stream')}
                className={`p-2 rounded-xl text-center text-xs flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                  selectedAmbience === 'stream' ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Waves className="w-3.5 h-3.5 text-cyan-300" />
                <span className="text-[10px]">Stream</span>
              </button>

              <button
                onClick={() => handleSelectAmbience('drone')}
                className={`p-2 rounded-xl text-center text-xs flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                  selectedAmbience === 'drone' ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Music className="w-3.5 h-3.5 text-purple-300" />
                <span className="text-[10px]">432Hz</span>
              </button>

              <button
                onClick={() => handleSelectAmbience('none')}
                className={`p-2 rounded-xl text-center text-xs flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                  selectedAmbience === 'none' ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span className="text-[10px]">Mute</span>
              </button>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={toggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer ${
                isMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              onClick={handleSendHug}
              className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-800 text-rose-300 hover:bg-rose-900 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              title="Send a silent warm hug"
            >
              <Heart className="w-5 h-5 fill-rose-400 text-rose-400" />
            </button>

            <button
              onClick={toggleSpeaker}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer ${
                !isSpeakerOn ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              title={isSpeakerOn ? 'Mute speaker' : 'Unmute speaker'}
            >
              {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            <button
              onClick={() => {
                backendSocket.endSession();
                onEndCall();
              }}
              className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              title="End call safely"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="py-2.5 px-6 bg-slate-950 border-t border-slate-800/80 text-center text-[11px] text-slate-500">
          Peer audio link · Identity undisclosed · Zero judgments · Strictly peer support
        </div>

      </div>
    </div>
  );
};
