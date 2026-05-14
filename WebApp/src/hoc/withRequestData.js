import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RequestContext } from '../App';
import { activeItem, approveItem, deactiveItem, deleteItem, getList } from '../systems/api';
import { defaultFilters } from '../systems/constant';
import { useTranslation } from 'react-i18next';

const withRequestData = (WrappedComponent, component) => {
  return (props) => {
    const { t } = useTranslation();
    const componentKey = component || 'default';
    const navigate = useNavigate();
    const location = useLocation();
    const [currentPage, setCurrentPage] = useState(() => {
      return parseInt(sessionStorage.getItem(`${componentKey}_currentPage`)) || 1;
    });
    const [requests, setRequests] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [requestsPerPage, setRequestsPerPage] = useState(() => {
      return parseInt(sessionStorage.getItem(`${componentKey}_requestsPerPage`)) || 20;
    });
    const [totalItems, setTotalItems] = useState(0);
    const [filters, setFilters] = useState(() => {
      return JSON.parse(sessionStorage.getItem(`${componentKey}_filters`)) || defaultFilters;
    });
    const [loading, setLoading] = useState(false);
    const [tempFilters, setTempFilters] = useState(filters);
    const { setRequest, setError, showConfirmModal } = useContext(RequestContext);

    useEffect(() => {
      const params = new URLSearchParams(location.search);
      const id = params.get('id');
      if (id) {
        setFilters((prevFilters) => ({ ...prevFilters, id }));
        setTempFilters((prevFilters) => ({ ...prevFilters, id }));
        params.delete('id');
        navigate({ search: params.toString() });
      }
    }, [location.search, navigate]);

    useEffect(() => {
      sessionStorage.setItem(`${componentKey}_currentPage`, currentPage);
    }, [componentKey, currentPage]);

    useEffect(() => {
      sessionStorage.setItem(`${componentKey}_requestsPerPage`, requestsPerPage);
    }, [componentKey, requestsPerPage]);

    useEffect(() => {
      sessionStorage.setItem(`${componentKey}_filters`, JSON.stringify(filters));
    }, [componentKey, filters]);

    useEffect(() => {
      const controller = new AbortController();
      const signal = controller.signal;

      setLoading(true);
      getList(component, filters, currentPage, requestsPerPage, { signal }).then(({ currentItems, totalPages, totalItems }) => {
        setRequests(currentItems);
        setTotalPages(totalPages);
        setTotalItems(totalItems);
        setLoading(false);
        if (currentPage > totalPages) {
          setCurrentPage(Math.max(totalPages, 1));
        }
      }).catch(error => {
        if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
          console.error('Fetch error:', error);
          setLoading(false);
        }
      });

      return () => {
        controller.abort();
      };
    }, [currentPage, requestsPerPage, filters]);
  
    const handleAction = (id, actionType) => {
      const messages = {
        deleteRoom: t('common.Khi xoá phòng, các đặt phòng liên quan sẽ tự động bị huỷ. Bạn có chắc chắn muốn xoá dữ liệu có ID = [id] không?', { id }),
        deactivateRoom: t('common.Khi tạm khoá phòng, các đặt phòng liên quan sẽ tự động bị huỷ. Bạn có chắc chắn muốn tạm khoá dữ liệu có ID = [id] không?', { id }),
        delete: t('common.Bạn có chắc chắn muốn xoá dữ liệu có ID = [id] không?', { id }),
        deactivate: t('common.Bạn có chắc chắn muốn tạm khoá dữ liệu có ID = [id] không?', { id }),
        activate: t('common.Bạn có chắc chắn muốn mở khoá dữ liệu có ID = [id] không?', { id }),
        approve: t('common.Bạn có chắc chắn muốn duyệt đặt phòng có ID = [id] không?', { id }),
      };
  
      const actions = {
        deleteRoom: () => deleteItem(component, id),
        deactivateRoom: () => deactiveItem(component, id),
        delete: () => deleteItem(component, id),
        deactivate: () => deactiveItem(component, id),
        activate: () => activeItem(component, id),
        approve: () => approveItem(component, id),
      };
  
      showConfirmModal(messages[actionType], () => {
        setLoading(true);
        actions[actionType]()
          .then((response) => {
            if (response?.status === "error") {
              setError(t(response.message ?? 'common.Lỗi khi gửi yêu cầu'));
            } else {
              setFilters({ ...tempFilters, forceReload: tempFilters.forceReload + 1 });
            }
          })
          .catch((error) => {
            console.error(`Failed to ${actionType}:`, error);
            setError(t('common.Lỗi khi gửi yêu cầu'));
          })
          .finally(() => setLoading(false));
      });
    };
  
    const handleEdit = (id, editRoute) => {
      const request = requests.find(request => request.id === id);
      setRequest(request);
      navigate(`${editRoute}/${id}`);
    };

    const handleEndBooking = (id, editRoute) => {
      const request = requests.find(request => request.id === id);
      setRequest({...request, isEndBooking: true});
      navigate(`${editRoute}/${id}`);
    };

    return (
      <WrappedComponent
        {...props}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        requestsPerPage={requestsPerPage}
        setRequestsPerPage={setRequestsPerPage}
        requests={requests}
        setRequests={setRequests}
        totalPages={totalPages}
        totalItems={totalItems}
        filters={filters}
        setFilters={setFilters}
        loading={loading}
        setLoading={setLoading}
        tempFilters={tempFilters}
        setTempFilters={setTempFilters}
        handleAction={handleAction}
        handleEdit={handleEdit}
        handleEndBooking={handleEndBooking}
      />
    );
  };
};

export default withRequestData;
