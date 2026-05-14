import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

function PaginationTableLayout({ totalPages, currentPage, requestsPerPage = 20, handlePageChange, handlePageLimitChange }) {
    const pages = [];
    const maxPagesToShow = 3;
    const startPage = Math.max(1, currentPage - Math.ceil(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    if (totalPages === 0) return <div></div>;
  
    return (
        <div className="my-4 flex items-center justify-between">
            <div className="flex items-center text-sm">
                <button
                    className={`mx-1 text-xs flex items-center justify-center w-[24px] h-[24px] rounded bg-gray-200`}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <FaChevronLeft />
                </button>
                {startPage > 1 && <span className="w-[24px] h-[24px] rounded flex items-center justify-center mx-1">...</span>}
                {pages.map(page => (
                    <button
                    key={page}
                    className={`w-[24px] h-[24px] rounded flex items-center justify-center mx-1 ${currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => handlePageChange(page)}
                    >
                    {page}
                    </button>
                ))}
                {endPage < totalPages && <span className="w-[24px] h-[24px] rounded flex items-center justify-center mx-1">...</span>}
                <button
                    className={`mx-1 text-xs flex items-center justify-center w-[24px] h-[24px] rounded bg-gray-200`}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <FaChevronRight />
                </button>
            </div>
            <select
                value={requestsPerPage}
                onChange={(e) => handlePageLimitChange(Number(e.target.value))}
                className="h-[24px] w-[100px] text-sm border rounded"
            >
                <option value={10}>10 / 1 page</option>
                <option value={20}>20 / 1 page</option>
                <option value={30}>30 / 1 page</option>
                <option value={40}>40 / 1 page</option>
                <option value={50}>50 / 1 page</option>
            </select>
        </div>
    );
}

export default PaginationTableLayout;