import React from 'react';
import styles from './pagination.module.css'

const Pagination = ({currentPage, nextPage, totalPages, changePage}) => {

    const prevPageHtml = (currentPage > 1)?<div className = {styles['pagination-item']} onClick={() => changePage(currentPage -1)}>&lt;&lt;&lt;</div>:<div></div>
    const currentPageHtml = <div className = {styles['pagination-current']}>{currentPage} of {totalPages}</div>
    const nextPageHtml = (nextPage != null)?<div className = {styles['pagination-item']} onClick={() => changePage(nextPage)}>&gt;&gt;&gt;</div>:<div></div>

    return (
        <div className={styles['pagination-container']}>{prevPageHtml}{currentPageHtml}{nextPageHtml}</div>
    )
}

export default Pagination;
