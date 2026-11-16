import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSellerProperty, useProperties } from '../query/hooks/usePropertyQueries';
import { PropertyDetailsPage } from './PropertyDetailsPage';
import { PropertyDetailsSkeleton } from '../components/common/Skeleton';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleSaveProperty, toggleCompareProperty, openEnquiryModal } from '../store/slices/uiSlice';
import EditIcon from '@mui/icons-material/Edit';
import DashboardIcon from '@mui/icons-material/Dashboard';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import LockIcon from '@mui/icons-material/Lock';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export const SellerPropertyPreviewPage: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const lang = useAppSelector((state) => state.ui.language);
  const savedPropertyIds = useAppSelector((state) => state.ui.savedPropertyIds);
  const comparedPropertyIds = useAppSelector((state) => state.ui.comparedPropertyIds);

  const { data: property, isLoading, isError, error } = useSellerProperty(idOrSlug);
  const { data: allProperties = [] } = useProperties();

  if (isLoading) {
    return <PropertyDetailsSkeleton />;
  }

  if (isError || !property) {
    const isForbidden = (error as any)?.status === 403;
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FAF8F2] px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200 shadow-xl text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            {isForbidden ? <LockIcon sx={{ fontSize: 32 }} /> : <WarningAmberIcon sx={{ fontSize: 32 }} />}
          </div>
          <h2 className="text-2xl font-black text-[#18241B] tracking-tight mb-2">
            {isForbidden ? 'Access Denied' : 'Property Not Found'}
          </h2>
          <p className="text-sm text-stone-600 mb-6 leading-relaxed">
            {isForbidden
              ? 'You do not have permission to preview this private listing. Only the verified owner or staff administrators can view unpublished properties.'
              : 'The requested property could not be found or has been removed from your seller account.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/seller/dashboard')}
              className="flex-1 py-3 bg-[#013E18] text-[#F5F2E9] rounded-xl font-bold text-xs hover:bg-[#00280f] transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <DashboardIcon sx={{ fontSize: 16 }} />
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex-1 py-3 border border-stone-300 text-stone-700 rounded-xl font-bold text-xs hover:bg-stone-50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ArrowBackIcon sx={{ fontSize: 16 }} />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pubStatus = (property as any).publishingStatus || ((property as any).published ? 'published' : 'pending-review');

  const statusBadge = (() => {
    switch (pubStatus) {
      case 'published':
        return {
          label: 'Published (Live)',
          bg: 'bg-emerald-500/10 text-emerald-800 border-emerald-300',
          icon: <CheckCircleIcon sx={{ fontSize: 16, color: '#059669' }} />,
          msg: 'This listing is published live and visible to buyers on the public Grounds & Gates catalog.',
        };
      case 'pending-review':
        return {
          label: 'Pending Admin Review',
          bg: 'bg-amber-500/10 text-amber-800 border-amber-300',
          icon: <HourglassEmptyIcon sx={{ fontSize: 16, color: '#D97706' }} />,
          msg: 'Submitted for legal title clearance and verification by the Grounds & Gates verification desk. Hidden from public live search until approved.',
        };
      case 'rejected':
        return {
          label: 'Review Rejected',
          bg: 'bg-rose-500/10 text-rose-800 border-rose-300',
          icon: <WarningAmberIcon sx={{ fontSize: 16, color: '#E11D48' }} />,
          msg: 'Listing requires corrections before publication. Please inspect review comments and update your listing.',
        };
      case 'draft':
      default:
        return {
          label: 'Unpublished Draft',
          bg: 'bg-stone-500/10 text-stone-700 border-stone-300',
          icon: <EditIcon sx={{ fontSize: 16, color: '#57534E' }} />,
          msg: 'This is an unsubmitted draft. You can continue updating specifications, pricing, and documents.',
        };
    }
  })();

  const targetIdOrSlug = property.slug || (property as any).referenceId || property.id;
  const previewPropId = property.id || (property as any).referenceId || (property as any)._id?.toString() || '';

  return (
    <div className="bg-[#FAF8F2] min-h-screen">
      {/* ─── STICKY SELLER PREVIEW TOP BAR ───────────────── */}
      <div className="sticky top-0 z-40 bg-[#18241B] text-white border-b border-[#013E18] shadow-lg backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase font-black tracking-widest bg-[#C99325] text-[#18241B] px-2.5 py-0.5 rounded-full">
              Seller Preview
            </span>
            <div className="flex items-center gap-1.5 text-xs text-stone-300">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-bold ${statusBadge.bg}`}>
                {statusBadge.icon}
                {statusBadge.label}
              </span>
            </div>
            <p className="hidden lg:block text-xs text-stone-400 italic max-w-xl truncate">
              {statusBadge.msg}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/edit-property/${targetIdOrSlug}`)}
              className="px-3.5 py-1.5 bg-[#C99325] hover:bg-[#b5821f] text-[#18241B] rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5"
            >
              <EditIcon sx={{ fontSize: 15 }} />
              Edit Listing
            </button>
            {pubStatus === 'published' && (
              <button
                onClick={() => navigate(`/properties/${property.slug || previewPropId}`)}
                className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <VisibilityIcon sx={{ fontSize: 15 }} />
                View Public URL
              </button>
            )}
            <button
              onClick={() => navigate('/seller/dashboard')}
              className="px-3.5 py-1.5 bg-white/5 hover:bg-white/15 text-stone-300 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <DashboardIcon sx={{ fontSize: 15 }} />
              Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* ─── REAL PROPERTY DETAILS VIEW ──────────────────── */}
      <PropertyDetailsPage
        property={property}
        allProperties={allProperties}
        lang={lang}
        onBack={() => navigate('/seller/dashboard')}
        isSaved={savedPropertyIds.includes(previewPropId)}
        savedPropertyIds={savedPropertyIds}
        onToggleSave={(id) => dispatch(toggleSaveProperty(id))}
        isCompared={comparedPropertyIds.includes(previewPropId)}
        comparedPropertyIds={comparedPropertyIds}
        onToggleCompare={(id) => dispatch(toggleCompareProperty(id))}
        onSelectProperty={(id) => navigate(`/seller/preview/${id}`)}
        onOpenEnquiry={() => dispatch(openEnquiryModal(previewPropId))}
      />
    </div>
  );
};
