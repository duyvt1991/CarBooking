import { useContext, useEffect, useState } from "react";
import { FaArrowLeft, FaPlus } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { RequestContext } from "../App";
import { routes } from "../systems/constant";
import { useTranslation } from "react-i18next";

function HeaderTableLayout({ addNewPath, additionButtons = [], backToUrl, headerLabel, hideAddNew, labelAddNew = "Thêm mới" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [backTo, setBackTo] = useState("/");
  const { t } = useTranslation();
  const { setRequest } = useContext(RequestContext);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const backTo = backToUrl ?? params.get('backTo');
    if (backTo) {
      setBackTo(backTo);
    }
  }, [location.search, backToUrl]);

  const handleAddNew = () => {
    if(addNewPath === routes.searchByDemand.path) {
      setRequest({ id: "*" });
      navigate(`${addNewPath}/*`);
    } else if(addNewPath === routes.bookingCalendar.path) {
      setRequest({ id: "*" });
      navigate(`${addNewPath}/*`);
    } else {
      setRequest({});
      navigate(`${addNewPath}/new`);
    }
  }

  return (
    <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
        <div className="flex gap-2 items-center">
          <div className="gap-2 flex items-center">
              <div className="flex gap-2 items-center cursor-pointer" onClick={() => navigate(backTo)}><FaArrowLeft /> <span>Back</span></div> 
              <span className="text-gray-300">|</span>
          </div>
          <h1 className="text-lg font-medium flex-grow text-center">{t(`routes.${headerLabel}`)}</h1>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {additionButtons.map((button, index) => (
            <div 
              key={index} 
              className="px-3 py-1.5 rounded-lg hover:bg-gray-700 hover:text-white transition duration-300 border border-gray-500 flex items-center cursor-pointer"
              onClick={button.onClick}
            >
              {button.icon && <button.icon className="mr-2" />}
              {t(`common.${button.label}`)}
            </div>
          ))}
          {!hideAddNew && <div 
          className="px-3 py-1.5 rounded-lg hover:bg-gray-700 hover:text-white transition duration-300 border border-gray-500 flex items-center cursor-pointer"
          onClick={handleAddNew}
          >
          <FaPlus className="mr-2" />
          {t(`common.${labelAddNew}`)}
          </div>}
        </div>
    </div>
  );
}

export default HeaderTableLayout;