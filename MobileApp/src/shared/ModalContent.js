import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";

const TABS = {
    HISTORY: 'history',
    DETAIL: 'detail'
}

function ModalContent({ title, fields, fieldLogs = [], tabs = [] }) {
    const [activeTab, setActiveTab] = useState(TABS.DETAIL);
    const { t } = useTranslation();
    const handleTabClick = (tab) => {
        setActiveTab(tab.isHistory ? TABS.HISTORY : TABS.DETAIL);
    };
    const isTabActive = (tab) => {
        if (activeTab === TABS.HISTORY && tab.isHistory) {
            return true;
        }
        if (activeTab === TABS.DETAIL && tab.isDetail) {
            return true;
        }
        return false;
    }
    return (
        <>
            {tabs.length > 0 && <div className="flex gap-2 justify-start items-center mb-4">
                {tabs.map((tab, index) => (
                    <button key={index} onClick={() => handleTabClick(tab)} className={`px-4 py-2 rounded ${isTabActive(tab) ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>}

            {activeTab === TABS.DETAIL && <>
            <h2 className="text-xl font-bold mb-4 flex align-middle justify-start">{title}</h2>
            <table className="min-w-full bg-white table-fixed mb-4">
                <tbody>
                    {fields.map((field, index) => <tr key={index}>
                        <td className="border px-4 py-2 w-[36%] font-bold">{field.label}:</td>
                        <td className="border px-4 py-2 w-[64%]">{field.value}</td>
                    </tr>
                    )}
                </tbody>
            </table>
            </>}
            {activeTab === TABS.HISTORY && fieldLogs.length > 0 && fieldLogs.map((log, index) => (
                <Fragment key={index}>
                    {log.oldValues.length > 0 && <div className="mb-4">
                        <h2 className="text-lg font-bold mb-2">{log.title}</h2>
                        <table className="min-w-full bg-white table-fixed">
                            <thead>
                                <tr>
                                    <th className="border px-4 py-2 w-[34%] font-bold">{t("log.Cột")}</th>
                                    <th className="border px-4 py-2 w-[33%] font-bold">{t("log.Giá trị cũ")}</th>
                                    <th className="border px-4 py-2 w-[33%] font-bold">{t("log.Giá trị mới")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {log.oldValues.map((field, index) => <tr key={index}>
                                    <td className="border px-4 py-2">{field.displayKey}</td>
                                    <td className="border px-4 py-2">{field.displayValue}</td>
                                    <td className="border px-4 py-2">{log.newValues.find(f => f.displayKey === field.displayKey)?.displayValue}</td>
                                </tr>
                                )}
                            </tbody>
                        </table>
                    </div>}
                </Fragment>
            ))}
        </>
    );
}

export default ModalContent;