import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Tabs,
  Tab,
  Button,
  TextField,
  Switch,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PublishIcon from '@mui/icons-material/Publish';
import UndoIcon from '@mui/icons-material/Undo';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/Delete';

import { api } from '../../../services/api';
import { WebContentSection } from '../../../types/masters';
import { LanguageCode } from '../../../types/property';

interface AdminContentModuleProps {
  lang: LanguageCode;
  onShowToast?: (message: string, type: 'success' | 'info' | 'error') => void;
}

export const AdminContentModule: React.FC<AdminContentModuleProps> = ({ lang, onShowToast }) => {
  const [activeSection, setActiveSection] = useState<string>('homepage_hero');
  const [currentContent, setCurrentContent] = useState<WebContentSection | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [contentLang, setContentLang] = useState<'en' | 'ta'>('en');

  // Form State
  const [title, setTitle] = useState<string>('');
  const [titleTa, setTitleTa] = useState<string>('');
  const [subtitle, setSubtitle] = useState<string>('');
  const [subtitleTa, setSubtitleTa] = useState<string>('');
  const [draftPayload, setDraftPayload] = useState<any>({});

  // Fetch Section Content
  const fetchSection = async (secKey: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getContentSection(secKey);
      if (data) {
        setCurrentContent(data);
        setTitle(data.title || '');
        setTitleTa(data.titleTa || '');
        setSubtitle(data.subtitle || '');
        setSubtitleTa(data.subtitleTa || '');
        setDraftPayload(data.draftContent || data.content || {});
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load content section.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSection(activeSection);
  }, [activeSection]);

  // Save Working Draft
  const handleSaveDraft = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await api.saveContentDraft(activeSection, {
        title,
        titleTa,
        subtitle,
        subtitleTa,
        draftContent: draftPayload,
      });
      setCurrentContent(res);
      if (onShowToast) onShowToast('Draft saved successfully. (Not visible to public yet)', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to save draft.');
    } finally {
      setIsSaving(false);
    }
  };

  // Publish Draft to Live Public Website
  const handlePublish = async () => {
    setIsPublishing(true);
    setError(null);
    try {
      // Save any pending draft changes first
      await api.saveContentDraft(activeSection, {
        title,
        titleTa,
        subtitle,
        subtitleTa,
        draftContent: draftPayload,
      });

      const published = await api.publishContent(activeSection);
      setCurrentContent(published);
      if (onShowToast) onShowToast('Content published live! Public website updated.', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to publish content.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Discard Working Draft
  const handleDiscardDraft = async () => {
    if (!window.confirm('Are you sure you want to discard draft changes and revert to the live published version?')) {
      return;
    }
    setIsSaving(true);
    try {
      const reverted = await api.discardContentDraft(activeSection);
      setCurrentContent(reverted);
      setTitle(reverted.title || '');
      setTitleTa(reverted.titleTa || '');
      setSubtitle(reverted.subtitle || '');
      setSubtitleTa(reverted.subtitleTa || '');
      setDraftPayload(reverted.content || {});
      if (onShowToast) onShowToast('Draft discarded. Reverted to published version.', 'info');
    } catch (err: any) {
      setError(err.message || 'Failed to discard draft.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Module Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#18241B' }}>
            {lang === 'ta' ? 'வலைத்தள உள்ளடக்க மேலாண்மை (CMS)' : 'Website Content Management'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#536458', mt: 0.5 }}>
            {lang === 'ta'
              ? 'வலைத்தள பதாகைகள், முகப்பு உரை, எங்களைப் பற்றி, அடிக்கடி கேட்கப்படும் கேள்விகளை நிர்வகியுங்கள்.'
              : 'Directly manage public website copy, hero banners, section ordering, FAQs, and contact directory.'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          {currentContent?.status === 'draft' && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<UndoIcon />}
              onClick={handleDiscardDraft}
              sx={{ borderColor: '#8C9A90', color: '#536458', fontWeight: 700, borderRadius: '10px', textTransform: 'none' }}
            >
              Discard Draft
            </Button>
          )}

          <Button
            variant="outlined"
            size="small"
            startIcon={<SaveIcon />}
            disabled={isSaving || isPublishing}
            onClick={handleSaveDraft}
            sx={{ borderColor: '#013E18', color: '#013E18', fontWeight: 800, borderRadius: '10px', textTransform: 'none' }}
          >
            {isSaving ? <CircularProgress size={16} /> : 'Save Draft'}
          </Button>

          <Button
            variant="contained"
            size="small"
            startIcon={<PublishIcon />}
            disabled={isSaving || isPublishing}
            onClick={handlePublish}
            sx={{ bgcolor: '#013E18', color: '#FFFFFF', fontWeight: 800, borderRadius: '10px', textTransform: 'none', px: 2.5, '&:hover': { bgcolor: '#00280F' } }}
          >
            {isPublishing ? <CircularProgress size={16} sx={{ color: '#FFFFFF' }} /> : 'Publish to Live'}
          </Button>
        </Box>
      </Box>

      {/* Section Tabs */}
      <Card sx={{ borderRadius: '16px', mb: 3, border: '1px solid #ECE7DA', boxShadow: 'none' }}>
        <Tabs
          value={activeSection}
          onChange={(_, val) => setActiveSection(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: '1px solid #ECE7DA',
            bgcolor: '#FAF8F2',
            '& .MuiTab-root': {
              fontWeight: 800,
              fontSize: '0.84rem',
              textTransform: 'none',
              py: 1.8,
              color: '#536458',
              '&.Mui-selected': { color: '#013E18' },
            },
            '& .MuiTabs-indicator': { bgcolor: '#C99325', height: 3 },
          }}
        >
          <Tab value="homepage_hero" label="🌟 Homepage Hero & Search" />
          <Tab value="homepage_sections" label="📑 Homepage Sections Ordering" />
          <Tab value="about_page" label="🏢 About Grounds & Gates" />
          <Tab value="contact_page" label="📞 Contact & Regional Branches" />
          <Tab value="faqs" label="❓ FAQs Directory" />
        </Tabs>
      </Card>

      {/* Active Section Content Card */}
      <Card sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: '16px', border: '1px solid #ECE7DA', boxShadow: 'none' }}>
        {/* Status Bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 2, borderBottom: '1px solid #ECE7DA' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {currentContent?.status === 'published' ? (
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                label="Published (Live on Website)"
                size="small"
                sx={{ bgcolor: 'rgba(1, 62, 24, 0.1)', color: '#013E18', fontWeight: 800 }}
              />
            ) : (
              <Chip
                icon={<WarningAmberIcon sx={{ fontSize: 16 }} />}
                label="Draft Changes (Not Live Yet)"
                size="small"
                sx={{ bgcolor: 'rgba(201, 147, 37, 0.12)', color: '#92400E', fontWeight: 800 }}
              />
            )}
            <Typography variant="caption" sx={{ color: '#8C9A90', fontWeight: 700 }}>
              Version {currentContent?.version || 1} • {currentContent?.publishedAt ? `Published: ${new Date(currentContent.publishedAt).toLocaleDateString()}` : 'Unpublished'}
            </Typography>
          </Box>

          {/* Bilingual Switcher */}
          <Box sx={{ display: 'flex', bgcolor: '#FAF8F2', p: 0.4, borderRadius: '8px', border: '1px solid #ECE7DA' }}>
            <Button
              size="small"
              onClick={() => setContentLang('en')}
              sx={{
                fontSize: '0.72rem',
                fontWeight: 800,
                py: 0.3,
                px: 1.5,
                bgcolor: contentLang === 'en' ? '#013E18' : 'transparent',
                color: contentLang === 'en' ? '#FFFFFF' : '#536458',
                borderRadius: '6px',
                minWidth: 'auto',
              }}
            >
              English
            </Button>
            <Button
              size="small"
              onClick={() => setContentLang('ta')}
              sx={{
                fontSize: '0.72rem',
                fontWeight: 800,
                py: 0.3,
                px: 1.5,
                bgcolor: contentLang === 'ta' ? '#013E18' : 'transparent',
                color: contentLang === 'ta' ? '#FFFFFF' : '#536458',
                borderRadius: '6px',
                minWidth: 'auto',
              }}
            >
              தமிழ் (Tamil)
            </Button>
          </Box>
        </Box>

        {isLoading ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <CircularProgress sx={{ color: '#013E18' }} />
            <Typography variant="body2" sx={{ color: '#536458', mt: 2, fontWeight: 700 }}>
              Loading section payload...
            </Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
            {error}
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Title & Subtitle */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
              <TextField
                label={contentLang === 'en' ? 'Section Main Title (English)' : 'பிரிவின் முக்கிய தலைப்பு (தமிழ்)'}
                size="small"
                fullWidth
                value={contentLang === 'en' ? title : titleTa}
                onChange={(e) => (contentLang === 'en' ? setTitle(e.target.value) : setTitleTa(e.target.value))}
                sx={{ '& fieldset': { borderRadius: '10px' } }}
              />

              <TextField
                label={contentLang === 'en' ? 'Section Subtitle / Tagline (English)' : 'பிரிவின் துணைத்தலைப்பு (தமிழ்)'}
                size="small"
                fullWidth
                value={contentLang === 'en' ? subtitle : subtitleTa}
                onChange={(e) => (contentLang === 'en' ? setSubtitle(e.target.value) : setSubtitleTa(e.target.value))}
                sx={{ '& fieldset': { borderRadius: '10px' } }}
              />
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* SECTION SPECIFIC FORM BLOCKS */}
            {activeSection === 'homepage_hero' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#013E18' }}>
                  Hero Banner CTA Controls
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    label="Headline Badge Text"
                    size="small"
                    value={contentLang === 'en' ? draftPayload.headlineBadge || '' : draftPayload.headlineBadgeTa || ''}
                    onChange={(e) =>
                      setDraftPayload({
                        ...draftPayload,
                        [contentLang === 'en' ? 'headlineBadge' : 'headlineBadgeTa']: e.target.value,
                      })
                    }
                    sx={{ '& fieldset': { borderRadius: '10px' } }}
                  />

                  <TextField
                    label="Primary CTA Button Label"
                    size="small"
                    value={contentLang === 'en' ? draftPayload.ctaPrimaryText || '' : draftPayload.ctaPrimaryTextTa || ''}
                    onChange={(e) =>
                      setDraftPayload({
                        ...draftPayload,
                        [contentLang === 'en' ? 'ctaPrimaryText' : 'ctaPrimaryTextTa']: e.target.value,
                      })
                    }
                    sx={{ '& fieldset': { borderRadius: '10px' } }}
                  />
                </Box>
              </Box>
            )}

            {activeSection === 'homepage_sections' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#013E18' }}>
                  Homepage Section Visibility & Layout Controls
                </Typography>
                <Typography variant="caption" sx={{ color: '#536458', mb: 1 }}>
                  Toggle sections on or off to change the live appearance of the public homepage.
                </Typography>

                {Array.isArray(draftPayload.sections) &&
                  draftPayload.sections.map((sec: any, idx: number) => (
                    <Card
                      key={sec.id}
                      sx={{
                        p: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderRadius: '12px',
                        border: '1px solid #ECE7DA',
                        bgcolor: '#FAF8F2',
                      }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#18241B' }}>
                          {idx + 1}. {sec.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#8C9A90' }}>
                          ID: {sec.id}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Switch
                          checked={sec.visible}
                          onChange={(e) => {
                            const updated = [...draftPayload.sections];
                            updated[idx].visible = e.target.checked;
                            setDraftPayload({ ...draftPayload, sections: updated });
                          }}
                          color="success"
                        />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: sec.visible ? '#013E18' : '#8C9A90' }}>
                          {sec.visible ? 'Visible' : 'Hidden'}
                        </Typography>
                      </Box>
                    </Card>
                  ))}
              </Box>
            )}

            {activeSection === 'about_page' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  label={contentLang === 'en' ? 'Company Mission Statement (English)' : 'நிறுவன நோக்கம் (தமிழ்)'}
                  size="small"
                  fullWidth
                  multiline
                  rows={3}
                  value={contentLang === 'en' ? draftPayload.mission || '' : draftPayload.missionTa || ''}
                  onChange={(e) =>
                    setDraftPayload({
                      ...draftPayload,
                      [contentLang === 'en' ? 'mission' : 'missionTa']: e.target.value,
                    })
                  }
                  sx={{ '& fieldset': { borderRadius: '10px' } }}
                />

                <TextField
                  label={contentLang === 'en' ? 'Founding Story (English)' : 'தோற்றுவிக்கப்பட்ட வரலாறு (தமிழ்)'}
                  size="small"
                  fullWidth
                  multiline
                  rows={4}
                  value={contentLang === 'en' ? draftPayload.story || '' : draftPayload.storyTa || ''}
                  onChange={(e) =>
                    setDraftPayload({
                      ...draftPayload,
                      [contentLang === 'en' ? 'story' : 'storyTa']: e.target.value,
                    })
                  }
                  sx={{ '& fieldset': { borderRadius: '10px' } }}
                />
              </Box>
            )}

            {activeSection === 'contact_page' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    label="Primary Hotline Number"
                    size="small"
                    value={draftPayload.primaryPhone || ''}
                    onChange={(e) => setDraftPayload({ ...draftPayload, primaryPhone: e.target.value })}
                    sx={{ '& fieldset': { borderRadius: '10px' } }}
                  />
                  <TextField
                    label="Secondary Concierge Phone"
                    size="small"
                    value={draftPayload.secondaryPhone || ''}
                    onChange={(e) => setDraftPayload({ ...draftPayload, secondaryPhone: e.target.value })}
                    sx={{ '& fieldset': { borderRadius: '10px' } }}
                  />
                </Box>

                <TextField
                  label="Official Support Email"
                  size="small"
                  value={draftPayload.supportEmail || ''}
                  onChange={(e) => setDraftPayload({ ...draftPayload, supportEmail: e.target.value })}
                  sx={{ '& fieldset': { borderRadius: '10px' } }}
                />

                <TextField
                  label={contentLang === 'en' ? 'Business Operating Hours' : 'அலுவலக வேலை நேரம் (தமிழ்)'}
                  size="small"
                  value={contentLang === 'en' ? draftPayload.operationalHours || '' : draftPayload.operationalHoursTa || ''}
                  onChange={(e) =>
                    setDraftPayload({
                      ...draftPayload,
                      [contentLang === 'en' ? 'operationalHours' : 'operationalHoursTa']: e.target.value,
                    })
                  }
                  sx={{ '& fieldset': { borderRadius: '10px' } }}
                />
              </Box>
            )}

            {activeSection === 'faqs' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#013E18' }}>
                    FAQ Items Management ({draftPayload.items?.length || 0})
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      const items = draftPayload.items ? [...draftPayload.items] : [];
                      items.push({ q: 'New Question?', qTa: 'புதிய கேள்வி?', a: 'Answer text here.', aTa: 'பதில் உரை இங்கே.' });
                      setDraftPayload({ ...draftPayload, items });
                    }}
                    sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 800, color: '#013E18', borderColor: '#013E18' }}
                  >
                    Add FAQ
                  </Button>
                </Box>

                {Array.isArray(draftPayload.items) &&
                  draftPayload.items.map((item: any, idx: number) => (
                    <Card key={idx} sx={{ p: 2, borderRadius: '12px', border: '1px solid #ECE7DA', bgcolor: '#FAF8F2' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#C99325' }}>
                          FAQ #{idx + 1}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => {
                            const updated = draftPayload.items.filter((_: any, i: number) => i !== idx);
                            setDraftPayload({ ...draftPayload, items: updated });
                          }}
                          sx={{ color: '#B3261E' }}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <TextField
                          label={contentLang === 'en' ? 'Question' : 'கேள்வி (தமிழ்)'}
                          size="small"
                          fullWidth
                          value={contentLang === 'en' ? item.q : item.qTa}
                          onChange={(e) => {
                            const updated = [...draftPayload.items];
                            updated[idx][contentLang === 'en' ? 'q' : 'qTa'] = e.target.value;
                            setDraftPayload({ ...draftPayload, items: updated });
                          }}
                          sx={{ '& fieldset': { borderRadius: '8px' } }}
                        />
                        <TextField
                          label={contentLang === 'en' ? 'Answer' : 'பதில் (தமிழ்)'}
                          size="small"
                          fullWidth
                          multiline
                          rows={2}
                          value={contentLang === 'en' ? item.a : item.aTa}
                          onChange={(e) => {
                            const updated = [...draftPayload.items];
                            updated[idx][contentLang === 'en' ? 'a' : 'aTa'] = e.target.value;
                            setDraftPayload({ ...draftPayload, items: updated });
                          }}
                          sx={{ '& fieldset': { borderRadius: '8px' } }}
                        />
                      </Box>
                    </Card>
                  ))}
              </Box>
            )}
          </Box>
        )}
      </Card>
    </Box>
  );
};

