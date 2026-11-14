import React, { useState, useRef, useEffect } from 'react';
import { Property, LanguageCode } from '../../types/property';
import { formatPriceINR } from '../../utils/propertyUtils';
import {
  Fab,
  Paper,
  Box,
  Typography,
  TextField,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface AiPropertyAssistantProps {
  properties: Property[];
  lang: LanguageCode;
  onSelectProperty: (id: string) => void;
  onNavigate: (view: string, params?: any) => void;
}

interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  matchedProperties?: Property[];
  timestamp: string;
}

export const AiPropertyAssistant: React.FC<AiPropertyAssistantProps> = ({
  properties,
  lang,
  onSelectProperty,
  onNavigate: _onNavigate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialWelcomeMessage: ChatMessage = {
    id: 'welcome-1',
    sender: 'assistant',
    text: lang === 'ta'
      ? 'வணக்கம்! நான் கிரவுண்ட்ஸ் அண்ட் கேட்ஸ் சொத்து வழிகாட்டி. உங்களுக்கு எந்த மாதிரியான மனை அல்லது வீடு தேவைப்படுகிறது?'
      : 'Hello! I am your Grounds & Gates Property Assistant. How can I help you find your dream plot, villa, or farmland across Tamil Nadu today?',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialWelcomeMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickPrompts = [
    { label: 'Villa plots in Coimbatore < ₹50L', query: 'villa plot in coimbatore under 50 lakhs' },
    { label: 'ECR Beachside Villas in Chennai', query: 'beachside villa in ecr chennai' },
    { label: 'Agricultural Land in Pollachi', query: 'agricultural coconut grove in pollachi' },
    { label: '2BHK / 3BHK IT Corridor Flats', query: 'apartments in it corridor' },
  ];

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let matched: Property[] = [];

      const districts = ['coimbatore', 'chennai', 'madurai', 'tiruppur', 'erode', 'salem', 'trichy', 'pollachi', 'ooty', 'hosur'];
      const matchedDistrict = districts.find(d => lower.includes(d));

      const isVillaPlot = lower.includes('villa plot') || (lower.includes('villa') && lower.includes('plot'));
      const isPlot = !isVillaPlot && (lower.includes('plot') || lower.includes('land') || lower.includes('மனை'));
      const isVilla = !isVillaPlot && (lower.includes('villa') || lower.includes('வில்லா'));
      const isHouse = lower.includes('house') || lower.includes('home') || lower.includes('வீடு');
      const isAgri = lower.includes('agri') || lower.includes('farm') || lower.includes('தோட்டம்') || lower.includes('coconut');
      const isFlat = lower.includes('apartment') || lower.includes('flat') || lower.includes('bhk');
      const isCommercial = lower.includes('commercial') || lower.includes('showroom') || lower.includes('office');

      const under50L = lower.includes('50 lakh') || lower.includes('50l') || lower.includes('under 50') || lower.includes('50 lakhs');
      const under1Cr = lower.includes('1 cr') || lower.includes('crore') || lower.includes('1cr');

      matched = properties.filter(p => {
        let score = true;
        if (matchedDistrict && p.district.toLowerCase() !== matchedDistrict) {
          score = false;
        }
        if (isVillaPlot && !(p.category === 'residential-plots' || p.category === 'villas')) score = false;
        if (isPlot && p.category !== 'residential-plots') score = false;
        if (isVilla && p.category !== 'villas') score = false;
        if (isHouse && p.category !== 'independent-houses') score = false;
        if (isAgri && p.category !== 'agricultural-land') score = false;
        if (isFlat && p.category !== 'apartments') score = false;
        if (isCommercial && p.category !== 'commercial-properties') score = false;

        if (under50L && p.price > 5000000) score = false;
        if (under1Cr && p.price > 10000000) score = false;

        return score;
      });

      if (matched.length === 0) {
        const stopWords = ['the', 'and', 'for', 'with', 'in', 'under', 'lakhs', 'lakh', 'crores', 'crore'];
        const words = lower.split(/\s+/).filter(w => w.length > 2 && !stopWords.includes(w));
        matched = properties.filter(p => {
          const haystack = `${p.title} ${p.district} ${p.location} ${p.category} ${(p.amenities || []).join(' ')}`.toLowerCase();
          return words.length > 0 && words.some(w => haystack.includes(w));
        });
      }

      const results = matched.slice(0, 3);

      let replyText = '';
      if (results.length > 0) {
        replyText = lang === 'ta'
          ? `உங்கள் தேடலுக்கு ஏற்ற ${results.length} சிறந்த சொத்துக்களை நான் கண்டறிந்துள்ளேன். கீழே விவரங்களைக் காணலாம்:`
          : `I found ${results.length} matching properties fitting your criteria in our Tamil Nadu catalog:`;
      } else {
        replyText = lang === 'ta'
          ? 'மன்னிக்கவும், உங்கள் குறிப்பிட்ட தேடலுக்கு நேரடி முடிவுகள் கிடைக்கவில்லை. கோயம்புத்தூர் அல்லது சென்னை மனைகளைத் தேட பரிந்துரைக்கிறேன்.'
          : `I couldn't find an exact match for "${text}". Try asking for "Plots in Coimbatore under ₹50L" or "Villas in ECR Chennai".`;
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        matchedProperties: results.length > 0 ? results : undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleResetChat = () => {
    setMessages([initialWelcomeMessage]);
  };

  return (
    <>
      {/* Floating Trigger FAB */}
      <Box sx={{ position: 'fixed', bottom: { xs: 80, sm: 84 }, right: { xs: 16, sm: 24 }, zIndex: 1200 }}>
        <Fab
          variant="extended"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open AI Property Assistant"
          sx={{
            bgcolor: '#013E18',
            color: '#F5F2E9',
            border: '2px solid #C99325',
            boxShadow: '0 8px 30px rgba(1, 62, 24, 0.35)',
            px: 2.5,
            py: 1.5,
            height: 48,
            '&:hover': {
              bgcolor: '#00280F',
              transform: 'scale(1.05)',
            },
            transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', mr: 1 }}>
            <SmartToyIcon sx={{ fontSize: 20, color: '#C99325' }} />
            <Box
              sx={{
                position: 'absolute',
                top: -2,
                right: -2,
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#C99325',
              }}
              className="animate-ping"
            />
          </Box>
          <Typography variant="button" sx={{ fontSize: '0.75rem', fontWeight: 800, display: { xs: 'none', sm: 'inline' } }}>
            Smart Match AI
          </Typography>
        </Fab>
      </Box>

      {/* Expandable Chat Drawer */}
      {isOpen && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: { xs: 96, sm: 104 },
            right: { xs: 16, sm: 24 },
            zIndex: 1300,
            width: { xs: 'calc(100vw - 32px)', sm: 420 },
            height: 540,
            maxHeight: '80vh',
            borderRadius: '24px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#FFFFFF',
            border: '1px solid rgba(24, 36, 27, 0.1)',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 2.5,
              py: 2,
              bgcolor: '#013E18',
              color: '#F5F2E9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(201, 147, 37, 0.3)',
            }}
          >
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <Avatar
                sx={{
                  bgcolor: 'rgba(201, 147, 37, 0.2)',
                  width: 36,
                  height: 36,
                  border: '1px solid rgba(201, 147, 37, 0.4)',
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 18, color: '#C99325' }} />
              </Avatar>
              <Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: '0.85rem' }}>
                    Grounds & Gates Smart Match
                  </Typography>
                  <Chip
                    label="LIVE"
                    size="small"
                    sx={{
                      bgcolor: '#C99325',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '0.55rem',
                      height: 18,
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: 'rgba(245, 242, 233, 0.75)', fontSize: '0.65rem' }}>
                  Intelligent matching assistant over live database listings
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Reset conversation">
                <IconButton
                  size="small"
                  onClick={handleResetChat}
                  sx={{ color: 'rgba(255, 255, 255, 0.8)', '&:hover': { color: '#FFFFFF', bgcolor: 'rgba(255, 255, 255, 0.1)' } }}
                >
                  <RestartAltIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Close chat">
                <IconButton
                  size="small"
                  onClick={() => setIsOpen(false)}
                  sx={{ color: 'rgba(255, 255, 255, 0.8)', '&:hover': { color: '#FFFFFF', bgcolor: 'rgba(255, 255, 255, 0.1)' } }}
                >
                  <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Chat Messages Body */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: '#FAF8F2', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                {msg.sender === 'assistant' && (
                  <Avatar sx={{ width: 28, height: 28, bgcolor: '#013E18', color: '#C99325', flexShrink: 0, mt: 0.5 }}>
                    <SmartToyIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                )}

                <Paper
                  elevation={0}
                  sx={{
                    maxWidth: '85%',
                    p: 1.8,
                    borderRadius: '16px',
                    bgcolor: msg.sender === 'user' ? '#013E18' : '#FFFFFF',
                    color: msg.sender === 'user' ? '#F5F2E9' : '#18241B',
                    border: msg.sender === 'user' ? 'none' : '1px solid #ECE7DA',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    borderBottomRightRadius: msg.sender === 'user' ? 2 : '16px',
                    borderBottomLeftRadius: msg.sender === 'assistant' ? 2 : '16px',
                  }}
                >
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                    {msg.text}
                  </Typography>

                  {/* Embedded Matching Properties */}
                  {msg.matchedProperties && msg.matchedProperties.length > 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mt: 1.5, pt: 1.5, borderTop: '1px solid #F0ECE1' }}>
                      {msg.matchedProperties.map(prop => (
                        <Box
                          key={prop.id}
                          onClick={() => {
                            onSelectProperty(prop.id);
                            setIsOpen(false);
                          }}
                          sx={{
                            p: 1,
                            borderRadius: '12px',
                            border: '1px solid #ECE7DA',
                            bgcolor: '#FAF8F2',
                            display: 'flex',
                            gap: 1.2,
                            alignItems: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: '#FFFFFF',
                              borderColor: '#013E18',
                              transform: 'translateX(2px)',
                            },
                          }}
                        >
                          <Box
                            component="img"
                            src={prop.images[0]}
                            alt={prop.title}
                            sx={{ width: 50, height: 50, borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                          />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="caption" sx={{ color: '#C99325', fontWeight: 800, fontSize: '0.6rem', textTransform: 'uppercase', display: 'block' }} noWrap>
                              {prop.category.replace('-', ' ')}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#18241B', fontSize: '0.75rem' }} noWrap>
                              {prop.title}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="caption" sx={{ fontWeight: 800, color: '#013E18', fontSize: '0.7rem' }}>
                                {formatPriceINR(prop.price)}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#8C9A90', fontSize: '0.65rem' }} noWrap>
                                {prop.location}
                              </Typography>
                            </Box>
                          </Box>
                          <ArrowForwardIcon sx={{ fontSize: 14, color: '#C99325', flexShrink: 0 }} />
                        </Box>
                      ))}
                    </Box>
                  )}

                  <Typography variant="caption" sx={{ color: msg.sender === 'user' ? 'rgba(245, 242, 233, 0.6)' : '#8C9A90', display: 'block', textAlign: 'right', mt: 0.8, fontSize: '0.6rem' }}>
                    {msg.timestamp}
                  </Typography>
                </Paper>
              </Box>
            ))}

            {isTyping && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: '#013E18', color: '#C99325' }}>
                  <SmartToyIcon sx={{ fontSize: 16 }} />
                </Avatar>
                <Paper elevation={0} sx={{ p: 1.2, borderRadius: '12px', bgcolor: '#FFFFFF', border: '1px solid #ECE7DA' }}>
                  <Box sx={{ display: 'flex', gap: 0.6 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#C99325' }} className="animate-bounce" />
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#013E18' }} className="animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#C99325' }} className="animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </Box>
                </Paper>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Quick Prompts Bar */}
          <Box sx={{ px: 2, py: 1, bgcolor: '#FFFFFF', borderTop: '1px solid #ECE7DA', display: 'flex', gap: 1, overflowX: 'auto', flexShrink: 0 }}>
            {quickPrompts.map((qp, idx) => (
              <Chip
                key={idx}
                label={qp.label}
                size="small"
                clickable
                onClick={() => handleSendMessage(qp.query)}
                sx={{
                  bgcolor: '#FAF8F2',
                  border: '1px solid #ECE7DA',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  color: '#18241B',
                  '&:hover': { bgcolor: '#EFEAE0', color: '#013E18' },
                  whiteSpace: 'nowrap',
                }}
              />
            ))}
          </Box>

          {/* Input Form */}
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            sx={{ p: 1.5, bgcolor: '#FFFFFF', borderTop: '1px solid #ECE7DA', display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}
          >
            <TextField
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={lang === 'ta' ? 'எ.கா: கோவையில் 50 லட்சத்திற்குள் மனை...' : 'e.g., Plots in Coimbatore under 50 Lakhs...'}
              fullWidth
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: '#FAF8F2' } }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        type="submit"
                        disabled={!inputText.trim()}
                        size="small"
                        sx={{
                          bgcolor: '#013E18',
                          color: '#F5F2E9',
                          '&:hover': { bgcolor: '#00280F' },
                          '&.Mui-disabled': { bgcolor: '#E5E0D5', color: '#A09886' },
                        }}
                      >
                        <SendIcon sx={{ fontSize: 15, color: '#C99325' }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
        </Paper>
      )}
    </>
  );
};
