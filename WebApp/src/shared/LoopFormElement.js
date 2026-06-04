import { useContext, useEffect } from 'react';
import SuggestInput from "./SuggestInput";
import { RequestContext } from '../App';
import { FaTimes, FaStar } from 'react-icons/fa';
import { formatColor } from '../systems/util';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';

function LoopFormElement({ component, labelWidth = "w-[200px]", field, initForm, request, errors, handleChange }) {
    const { t } = useTranslation();
    const isRequired = typeof initForm[field].required === 'function'
        ? initForm[field].required(request)
        : !!initForm[field].validate;

    useEffect(() => {
        if (initForm[field].type === 'select' && initForm[field].selectMappingField) {
            const mappingField = typeof initForm[field].selectMappingField === 'function'
                ? initForm[field].selectMappingField(request)
                : initForm[field].selectMappingField;
            if (mappingField?.length) {
                selectMappingField(field, request[field], mappingField);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [request[field]]);
    
    const suggestionMappingField = (value) => {
        let dests = [];
        let srcs = [];
        initForm[field].suggestionMappingField.forEach(([src, dest]) => {
            dests.push(dest);
            if (src === "*") {
                srcs.push(value);
            } else {
                srcs.push(value[src]);
            }
        });

        handleChange(dests, srcs);
    };

    const { masterData } = useContext(RequestContext);

    const tagsMappingField = (value) => {
        let dests = [];
        let srcs = [];
        initForm[field].tagsMappingField.forEach(([src, dest]) => {
            dests.push(dest);
            if (src === "*") {
                const key = initForm[field].tagsSchema?.key;
                srcs.push([...(request[dest] ?? []).filter(t => t[key].toString() !== value[key].toString()), value]);
            } else {
                srcs.push([...(request[dest] ?? []).filter(t => t.toString() !== value[src].toString()), value[src]]);
            }
        });
        handleChange(dests, srcs);
    };

    const removeTag = (tag) => {
        if (initForm[field].tagsSchema) {
            const { key } = initForm[field].tagsSchema;
            const newTags = (request[field] ?? []).filter(t => t[key].toString() !== tag.toString());
            handleChange(field, newTags);
        } else {
            const newTags = (request[field] ?? []).filter(t => t.toString() !== tag.toString());
            handleChange(field, newTags);
        }
    };

    const clearSuggestion = () => {
        handleChange(field, '');
    };

    const selectMappingField = (field, value, mappingField) => {
        const srcValue = masterData[initForm[field].optionsMasterDataKey ?? "default"]?.find(item => item.mkey?.toString() === value?.toString());
        let dests = [];
        let srcs = [];
        const fieldsToMap = mappingField || initForm[field].selectMappingField;
        fieldsToMap.forEach(([src, dest]) => {
            dests.push(dest ?? `placeholder.${src}`);
            srcs.push(srcValue ? srcValue[src] : "");
        });
        handleChange(dests, srcs);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && initForm[field].insertable && e.target.value) {
            e.preventDefault();
            const newTag = { mkey: e.target.value, mvalue: e.target.value };
            tagsMappingField(newTag);
        }
    };

    return (
        <div className="mb-4 flex items-center">
            <label className={`block text-gray-700 ${labelWidth}`} htmlFor={field}>
                {isRequired && <span className="text-red-600">*</span>} {t(initForm[field].label)}:
            </label>
            <div className="w-full relative">
                {initForm[field].type === 'suggest' ? (<>
                    <SuggestInput 
                        value={request[field]} 
                        onChange={(value) => suggestionMappingField(value)} 
                        isError={errors[field]}
                        suggestionDisplayField={initForm[field].suggestionDisplayField}
                        suggestionApi={initForm[field].suggestionApi}
                        optionsMasterDataKey={initForm[field].optionsMasterDataKey}
                        component={component}
                    />
                    <div className="tags-list">
                        {!!request[field] && <span className="tag">
                            {initForm[field].formatter ? initForm[field].formatter(request[field], masterData) : request[field]} <button type="button" onClick={() => clearSuggestion()}><FaTimes /></button>
                        </span>}
                    </div>
                </>) : initForm[field].type === 'select' ? (
                    <>
                    <select
                        disabled={initForm[field].disabled?.(request)}
                        value={initForm[field].isValueObject ? JSON.stringify(request[field]) : request[field]}
                        onChange={(e) => handleChange(field, initForm[field].isValueObject && e.target.value ? JSON.parse(e.target.value) : e.target.value)}
                        className={`w-full px-2 py-2 border rounded-lg ${errors[field] ? 'border-red-500' : ''}`}
                    >
                        <option value="">
                            - {t('common.Chọn')} -
                            {!!request[`placeholder.${field}`] && !request[field] && <> (
                            {!!initForm[field].optionsMasterDataKey && masterData[initForm[field].optionsMasterDataKey]?.find(option => option.mkey.toString() === request[`placeholder.${field}`])?.mvalue}
                            {!!initForm[field].options && t(initForm[field].options?.find(option => option.mkey.toString() === request[`placeholder.${field}`])?.mvalue)}
                            )</>}
                        </option>
                        {!!initForm[field].optionsMasterDataKey && masterData[initForm[field].optionsMasterDataKey]?.map((type, index) => (
                            <option key={index} value={initForm[field].isValueObject ? JSON.stringify(type) : type.mkey}>
                                {type.mvalue}
                            </option>
                        ))}
                        {!!initForm[field].options && initForm[field].options?.map((type, index) => (
                            <option key={index} value={initForm[field].isValueObject ? JSON.stringify(type) : type.mkey}>
                                {type.mvalue.includes(":") && type.mvalue.length === 5 ? type.mvalue : t(type.mvalue)}
                            </option>
                        ))}
                    </select>
                    </>
                ) : initForm[field].type === 'color' ? (
                    <div className="inline-block relative">
                        <input 
                            type="color" 
                            className={`box-content px-2 py-1 bg-transparent border rounded-lg ${errors[field] ? 'border-red-500' : ''}`} 
                            value={request[field]} 
                            onChange={(e) => handleChange(field, e.target.value)} 
                        />
                        {!request[field] && request[`placeholder.${field}`] && <span className="absolute -bottom-2 -right-2">{formatColor(request[`placeholder.${field}`])}</span>}
                        {request[field] && <button 
                            type="button" 
                            className="absolute -top-1.5 -right-1.5 text-gray-500 hover:text-gray-700" 
                            onClick={() => handleChange(field, '')}
                        >
                            <FaTimes />
                        </button>}
                    </div>
                ) : initForm[field].type === 'tags' ? (
                    <div className="tags-input-container">
                        <SuggestInput 
                            value={request[field]} 
                            maxItems={initForm[field].maxItems ?? 0}
                            onChange={(value) => tagsMappingField(value)} 
                            isError={errors[field]}
                            suggestionDisplayField={initForm[field].tagsDisplayField}
                            suggestionApi={initForm[field].tagsApi}
                            optionsMasterDataKey={initForm[field].optionsMasterDataKey}
                            component={component}
                            placeholder={initForm[field].placeholder}
                            onKeyDown={handleKeyDown}
                        />
                        <div className="tags-list">
                            {(Array.isArray(request[field]) ? request[field] : []).map(tag => {
                                if (initForm[field].tagsSchema) {
                                    const { key, value } = initForm[field].tagsSchema;
                                    return (
                                        <span key={tag[key]} className="tag">
                                            {initForm[field].formatter ? initForm[field].formatter([tag[value]], masterData) : tag[value]} <button type="button" onClick={() => removeTag(tag[key])}><FaTimes /></button>
                                        </span>
                                    )
                                }
                                return (
                                    <span key={tag} className="tag">
                                        {initForm[field].formatter ? initForm[field].formatter([tag], masterData) : tag} <button type="button" onClick={() => removeTag(tag)}><FaTimes /></button>
                                    </span>
                                )
                            })} 
                            {(request[field] || []).length === 0 && (request[`placeholder.${field}`] || []).map(tag => (
                                <span key={tag} className="tag text-gray-400">
                                    {initForm[field].formatter ? initForm[field].formatter([tag], masterData) : tag}
                                </span>
                            ))}
                        </div>
                    </div>
                ) : initForm[field].type === 'description' ? (
                    <p className="text-gray-700">{initForm[field].formatter && request[field] ? initForm[field].formatter(request[field], masterData) : request[field]}</p>
                ) : initForm[field].type === 'textarea' ? (
                    <textarea
                        placeholder={request[`placeholder.${field}`]}
                        readOnly={initForm[field].readonly?.(request)}
                        className={`w-full px-3 py-2 border read-only:bg-slate-200 rounded-lg placeholder-gray-400 ${errors[field] ? 'border-red-500' : ''}`}
                        value={request[field]}
                        onChange={(e) => handleChange(field, e.target.value)}
                    />
                ) : initForm[field].type === 'datepicker' ? (
                    <DatePicker 
                        disabled={initForm[field].disabled?.(request)}
                        selected={(() => {
                            try {
                            const date = parseISO(request[field]);
                            return !isNaN(date) ? date : null;
                            } catch (error) {
                            return null;
                            }
                        })()}
                        onChange={(date) => {
                            try {
                            handleChange(field, date ? format(date, 'yyyy-MM-dd') : '');
                            } catch (error) {
                            handleChange(field, '');
                            }
                        }}
                        dateFormat="dd/MM/yyyy"
                        minDate={initForm[field].disabledPast ? new Date() : null}
                        className={`block w-full px-3 py-2 border rounded-lg placeholder-gray-400 ${errors[field] ? 'border-red-500' : ''}`}
                        required
                        />
                ) : initForm[field].type === 'reviewScore' ? (
                    <div className="inline-flex space-x-1 px-3 py-2 border rounded-lg">
                        {Array.from({ length: 5 }, (_, i) => (
                            <FaStar 
                                key={i} 
                                className={i < request[field] ? 'text-yellow-500 cursor-pointer' : 'text-gray-300 cursor-pointer'} 
                                onClick={() => handleChange(field, i + 1)} 
                            />
                        ))}
                    </div>
                ) : initForm[field].type === 'radio' ? (
                    <div className="flex space-x-4">
                        {initForm[field].options.map((option, index) => (
                            <label key={index} className="flex items-center space-x-2">
                                <input 
                                    type="radio" 
                                    name={field} 
                                    value={option.mkey} 
                                    checked={request[field] === option.mkey} 
                                    onChange={(e) => handleChange(field, e.target.value)} 
                                    className="h-4 w-4 text-blue-700 border-gray-300 focus:ring-blue-500"
                                />
                                <span>{t(option.mvalue)}</span>
                            </label>
                        ))}
                    </div>
                ) : initForm[field].type === 'number' ? (
                    <input 
                        type="number" 
                        placeholder={request[`placeholder.${field}`]}
                        readOnly={initForm[field].readonly?.(request)}
                        className={`w-full px-3 py-2 border read-only:bg-slate-200 rounded-lg placeholder-gray-400 ${errors[field] ? 'border-red-500' : ''}`} 
                        value={request[field]} 
                        onChange={(e) => handleChange(field, e.target.value)} 
                    />
                ) : (
                    <input 
                        type="text" 
                        placeholder={request[`placeholder.${field}`]}
                        readOnly={initForm[field].readonly?.(request)}
                        className={`w-full px-3 py-2 border read-only:bg-slate-200 rounded-lg placeholder-gray-400 ${errors[field] ? 'border-red-500' : ''}`} 
                        value={request[field]} 
                        onChange={(e) => handleChange(field, e.target.value)} 
                    />
                )}
                {errors[field] && <p className="text-red-600 text-sm">{errors[field]}</p>}
            </div>
        </div>
    );
}

export default LoopFormElement;
