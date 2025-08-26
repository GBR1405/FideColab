class WebRTCService {
    constructor() {
        this.peerConnections = {};
        this.localStream = null;
        this.configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };
    }

    async initializeMedia() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                },
                video: false
            });
            this.localStream = stream;
            return stream;
        } catch (error) {
            console.error('Error accessing microphone:', error);
            throw error;
        }
    }

    createPeerConnection(socketId) {
        const peerConnection = new RTCPeerConnection(this.configuration);
        
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                window.socket.emit('ice-candidate', {
                    candidate: event.candidate,
                    to: socketId
                });
            }
        };

        peerConnection.ontrack = (event) => {
            const audio = new Audio();
            audio.srcObject = event.streams[0];
            audio.autoplay = true;
            audio.volume = 0.7;
            
            // Crear elemento visual para el audio del compañero
            this.createAudioIndicator(socketId, audio);
        };

        this.peerConnections[socketId] = peerConnection;
        return peerConnection;
    }

    async createOffer(socketId) {
        const peerConnection = this.createPeerConnection(socketId);
        
        this.localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, this.localStream);
        });

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        return offer;
    }

    async createAnswer(socketId, offer) {
        const peerConnection = this.createPeerConnection(socketId);
        
        this.localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, this.localStream);
        });

        await peerConnection.setRemoteDescription(offer);
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        return answer;
    }

    async handleAnswer(socketId, answer) {
        const peerConnection = this.peerConnections[socketId];
        if (peerConnection) {
            await peerConnection.setRemoteDescription(answer);
        }
    }

    async handleIceCandidate(socketId, candidate) {
        const peerConnection = this.peerConnections[socketId];
        if (peerConnection) {
            await peerConnection.addIceCandidate(candidate);
        }
    }

    createAudioIndicator(socketId, audioElement) {
        const indicator = document.createElement('div');
        indicator.className = 'audio-indicator';
        indicator.innerHTML = `
            <div class="audio-wave">
                <span></span><span></span><span></span><span></span><span></span>
            </div>
            <span class="audio-label">Compañero ${socketId.slice(-4)}</span>
        `;
        
        const container = document.querySelector('.team-audio-indicators') || 
                         document.body.appendChild(document.createElement('div'));
        container.className = 'team-audio-indicators';
        container.appendChild(indicator);
    }

    toggleMute() {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                return audioTrack.enabled;
            }
        }
        return false;
    }

    disconnect() {
        Object.values(this.peerConnections).forEach(pc => pc.close());
        this.peerConnections = {};
        
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
    }
}

export default new WebRTCService();