import { useContext, useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { RequestContext } from "../App";

function SuggestInput({ onChange, onKeyDown, placeholder, isError, maxItems, suggestionDisplayField, optionsMasterDataKey, suggestionApi, component, value }) {
    const { t } = useTranslation();
    const [suggestions, setSuggestions] = useState([]);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emptyResult, setEmptyResult] = useState(false);
    const { masterData } = useContext(RequestContext);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;
        if (!query) {
            setSuggestions([]);
            setIsLoading(false);
            setEmptyResult(false);
            return;
        }
        setIsLoading(true);
        if (optionsMasterDataKey) {
            const suggestionList = masterData[optionsMasterDataKey]?.filter(option => option.mvalue.toLowerCase().includes(query.toLowerCase()));
            setSuggestions(suggestionList ?? []);
            setEmptyResult(suggestionList?.length === 0);
            setIsLoading(false);
        } else {
            suggestionApi(component, query, { signal }).then((suggestionList) => {
                setSuggestions(suggestionList);
                setEmptyResult(suggestionList.length === 0);
                setIsLoading(false);
            }).catch(error => {
                if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
                    console.error('Fetch error:', error);
                }
                setIsLoading(false);
            });
        }

        return () => {
            controller.abort();
        };
    }, [component, masterData, optionsMasterDataKey, query, suggestionApi]);

    const highlightText = (text, highlight) => {
        const normalize = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const normalizedText = normalize(text);
        const normalizedHighlight = normalize(highlight);
        const parts = normalizedText.split(new RegExp(`(${normalizedHighlight})`, 'gi'));
        let currentIndex = 0;

        return parts.map((part, index) => {
            const originalPart = text.slice(currentIndex, currentIndex + part.length);
            currentIndex += part.length;

            return normalize(part) === normalizedHighlight
                ? <span key={index} className="bg-yellow-200">{originalPart}</span>
                : originalPart;
        });
    };

    return (
        <div className="relative w-full">
            <input
                type="text"
                placeholder={t(placeholder ?? 'common.Nhập từ khoá tìm kiếm...')}
                className={`w-full px-3 py-2 border rounded-lg placeholder-gray-400 ${isError ? 'border-red-500' : ''}`}
                value={query}
                disabled={maxItems && value && value.length >= maxItems}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        onKeyDown?.(e);
                        setQuery('');
                        setSuggestions([]);
                        setEmptyResult(false);
                    }
                }}
                onBlur={(e) => {
                    if (!e.relatedTarget || !e.relatedTarget.classList.contains('suggestion-item')) {
                        setQuery('');
                        setSuggestions([]);
                        setEmptyResult(false);
                    }
                }}
            />
            {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                </div>
            )}
            {suggestions.length > 0 ? (
                <ul className="absolute border rounded-lg mt-2 bg-white w-full z-10 max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            className="suggestion-item px-3 py-2 cursor-pointer hover:bg-gray-200"
                            onMouseDown={() => {
                                onChange(suggestion);
                                setQuery('');
                                setSuggestions([]);
                            }}
                        >
                            {highlightText(suggestion[suggestionDisplayField], query)}
                        </li>
                    ))}
                </ul>
            ) : (
                emptyResult && (
                    <div className="absolute border rounded-lg mt-2 bg-white w-full z-10 px-3 py-2 text-gray-500">
                        {t('common.Không tìm thấy kết quả!')}
                    </div>
                )
            )}
        </div>
    );
}

export default SuggestInput;