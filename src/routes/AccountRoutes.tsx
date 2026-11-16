import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BuyerDashboardPage } from '../pages/BuyerDashboardPage';
import { SellerDashboardPage } from '../pages/SellerDashboardPage';
import { useProperties, useSellerProperties } from '../query/hooks/usePropertyQueries';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleSaveProperty, toggleCompareProperty } from '../store/slices/uiSlice';

export const BuyerDashboardRoute: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const lang = useAppSelector((state) => state.ui.language);
  const savedPropertyIds = useAppSelector((state) => state.ui.savedPropertyIds);
  const comparedPropertyIds = useAppSelector((state) => state.ui.comparedPropertyIds);

  const { data: allProperties = [] } = useProperties();

  const savedProperties = React.useMemo(() => {
    return allProperties.filter((p) => savedPropertyIds.includes(p.id));
  }, [allProperties, savedPropertyIds]);

  const comparedProperties = React.useMemo(() => {
    return allProperties.filter((p) => comparedPropertyIds.includes(p.id));
  }, [allProperties, comparedPropertyIds]);

  return (
    <BuyerDashboardPage
      enquiries={[]}
      savedProperties={savedProperties}
      comparedProperties={comparedProperties}
      lang={lang}
      onNavigate={(view, params) => {
        if (view === 'properties') {
          navigate('/properties');
        } else {
          navigate(view.startsWith('/') ? view : `/${view}`);
        }
      }}
      onSelectProperty={(id) => navigate(`/properties/${id}`)}
      onToggleSave={(id) => dispatch(toggleSaveProperty(id))}
      onToggleCompare={(id) => dispatch(toggleCompareProperty(id))}
    />
  );
};

export const SellerDashboardRoute: React.FC = () => {
  const navigate = useNavigate();
  const lang = useAppSelector((state) => state.ui.language);
  const { data: sellerProperties = [] } = useSellerProperties();

  return (
    <SellerDashboardPage
      properties={sellerProperties}
      lang={lang}
      onNavigate={(view) => navigate(view.startsWith('/') ? view : `/${view}`)}
      onSelectProperty={(id) => navigate(`/properties/${id}`)}
    />
  );
};

