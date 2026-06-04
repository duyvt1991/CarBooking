import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RequestContext } from '../App';
import { cacheRequest } from '../systems/util';
import { submitItem } from '../systems/api';
import { routes } from '../systems/constant';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

const withRequestForm = (WrappedComponent, component, redirectPath, formLabel, initForm) => {
  return (props) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const requestContext = useContext(RequestContext);
    const { setLoading, setError, masterData, showConfirmModal } = useContext(RequestContext);
    const [request, setRequest] = useState(Object.fromEntries(Object.keys(initForm).map(field => [field, initForm[field].value])));

    useEffect(() => {
      if ((id && id !== 'new') || requestContext.request?.id === "*") {
        const cachedRequest = cacheRequest(requestContext, id, component);
        if (!cachedRequest || (cachedRequest.id?.toString() !== id?.toString() && cachedRequest.id?.toString() !== "*")) {
          navigate(redirectPath);
        } else {
          if (component === routes.roomTypeForm.component || component === routes.roomForm.component) {
            const newRequest = { 
              ...cachedRequest, 
              equipments: cachedRequest.equipments.filter(e => masterData.equipments?.find(md => md.mkey === e)) || [],
              approvers: cachedRequest.approvers.filter(e => masterData.approvers?.find(md => md.mkey === e)) || [],
            };
            setRequest(newRequest);
          } else {
            setRequest(cachedRequest);
          }
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
      const cloneRequest = { ...request };
      if (Object.keys(errors).length > 0) {
        checkValidation(cloneRequest);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [i18n.language])

    const checkValidation = (cloneRequest) => {
      const newErrors = {};
      Object.keys(initForm).forEach((field) => {
        const errorMessage = initForm[field].validate && initForm[field].validate(cloneRequest[field], t, cloneRequest);
        if (errorMessage) {
          newErrors[field] = errorMessage;
        }
      });
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const submitWithValidation = () => {
      const cloneRequest = { ...request };
      if (checkValidation(cloneRequest)) {
        if (component === routes.rejectBookingForm.component || component === routes.cancelBookingForm.component || component === routes.driverRejectBookingForm.component) {
          const messages = {
            [routes.rejectBookingForm.component]: t('common.Bạn có chắc chắn muốn từ chối đặt xe có ID = [id] không?', { id }),
            [routes.cancelBookingForm.component]: t('common.Bạn có chắc chắn muốn hủy đặt xe có ID = [id] không?', { id }),
            [routes.driverRejectBookingForm.component]: t('common.Bạn có chắc chắn muốn từ chối đặt xe có ID = [id] không?', { id }),
          };
          showConfirmModal(messages[component], () => {
            handleSubmit();
          });
        } else {
          handleSubmit();
        }
      } else {
        setSubmitted(true);
      }
    };

    const handleChange = (field, value) => {
      let updatedRequest = { ...request };
      if (Array.isArray(field)) {
        field.forEach((f, i) => {
          updatedRequest = { ...updatedRequest, [f]: value[i] };
        });
      } else {
        updatedRequest = { ...updatedRequest, [field]: value };
      }
      setRequest(updatedRequest);
      if (submitted) {
        checkValidation(updatedRequest);
      }
    };

    const handleSubmit = () => {
      setLoading(true);
      const encodedRequest = { ...request };
      Object.keys(encodedRequest).forEach(key => {
        if (typeof encodedRequest[key] === 'object' && encodedRequest[key] !== null) {
          encodedRequest[key] = JSON.stringify(encodedRequest[key]);
        }
      });

      submitItem(component, encodedRequest)
        .then(response => {
          // Handle successful submission
          console.log('Request submitted successfully:', response);
          if (response && response.status === "error") {
        setError(t(response.message ?? 'common.Lỗi khi gửi yêu cầu'));
          } else {
        if (component === routes.bookingForm.component) {
          navigate(-1);
        } else {
          navigate(redirectPath);
        }
          }
        })
        .catch(error => {
          console.error('Error submitting request:', error);
          setError(t('common.Lỗi khi gửi yêu cầu'));
        })
        .finally(() => {
          setLoading(false);
        });
    };

    return (
      <div className="m-1 p-6 shadow-md rounded-lg bg-white">
        {![routes.bookingCalendar.component].includes(component) && <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold flex-grow text-left">{t(`routes.${formLabel}`)} {request.id === "*" ? "" : (request.id ? ` - ID: ${request.id}` :  ` - ${t("common.Thêm mới")}`)}</h1>
        </div>}
        <form>
          <WrappedComponent
            {...props}
            request={request}
            setRequest={setRequest}
            errors={errors}
            handleChange={handleChange}
          />
          {![routes.searchByDemand.component, routes.bookingCalendar.component].includes(component) && (
            <div className="flex justify-center space-x-6">
              <button
                className="back-btn"
                type="button"
                onClick={() => navigate(redirectPath)}
              >
                {t('common.Trở về')}
              </button>
              <button
                className="submit-btn"
                type="button"
                onClick={submitWithValidation}
              >
                {t('common.Lưu')}
              </button>
            </div>
        )}
        </form>
      </div>
    );
  };
};

export default withRequestForm;
