import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";

const TABS = {
    HISTORY: 'history',
    DETAIL: 'detail'
}

const renderLogCell = (val) => {
    if (val === null || val === undefined || val === '') return '-';
    if (typeof val === 'boolean') return val ? 'Có' : 'Không';
    if (typeof val === 'object') {
        if (val.mvalue !== undefined) return val.mvalue || '-';
        try {
            return JSON.stringify(val);
        } catch (e) {
            return String(val);
        }
    }
    return String(val);
};

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
                    {fields.map((field, index) => {
                        const isHeader = !!field.isHeader;
                        if (isHeader) {
                            return (
                                <tr key={index} className="bg-gray-100/80">
                                    <td colSpan={2} className="border px-4 py-2 font-semibold text-gray-700 text-center">
                                        {field.label}
                                    </td>
                                </tr>
                            );
                        }
                        return (
                            <tr key={index}>
                                <td className="border px-4 py-2 w-[36%] font-bold">{field.label}:</td>
                                <td className="border px-4 py-2 w-[64%]">{field.value}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            </>}

            {activeTab === TABS.HISTORY && (
                fieldLogs && fieldLogs.length > 0 ? (
                    fieldLogs.map((log, index) => {
                        const oldValues = log.oldValues || [];
                        const newValues = log.newValues || [];
                        const map = new Map();

                        oldValues.forEach(f => {
                            if (f && (f.key || f.displayKey)) {
                                const k = f.key || f.displayKey;
                                map.set(k, { displayKey: f.displayKey, oldVal: f.displayValue, newVal: '-' });
                            }
                        });

                        newValues.forEach(f => {
                            if (f && (f.key || f.displayKey)) {
                                const k = f.key || f.displayKey;
                                if (map.has(k)) {
                                    map.get(k).newVal = f.displayValue;
                                } else {
                                    map.set(k, { displayKey: f.displayKey, oldVal: '-', newVal: f.displayValue });
                                }
                            }
                        });

                        const rows = Array.from(map.values());
                        if (rows.length === 0) return null;

                        return (
                            <div key={index} className="mb-4">
                                <h2 className="text-lg font-bold mb-2">{log.title}</h2>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white table-fixed">
                                        <thead>
                                            <tr>
                                                <th className="border px-4 py-2 w-[34%] font-bold text-left bg-gray-50">{t("log.Cột")}</th>
                                                <th className="border px-4 py-2 w-[33%] font-bold text-left bg-gray-50">{t("log.Giá trị cũ")}</th>
                                                <th className="border px-4 py-2 w-[33%] font-bold text-left bg-gray-50">{t("log.Giá trị mới")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.map((row, rIndex) => (
                                                <tr key={rIndex} className={rIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                    <td className="border px-4 py-2 font-medium">{row.displayKey}</td>
                                                    <td className="border px-4 py-2 text-gray-700">{renderLogCell(row.oldVal)}</td>
                                                    <td className="border px-4 py-2 text-gray-700">{renderLogCell(row.newVal)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center text-gray-500 py-6">{t("common.Không tìm thấy kết quả!")}</div>
                )
            )}
        </>
    );
}

export default ModalContent;