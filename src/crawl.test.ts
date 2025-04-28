import { describe, it, expect } from 'vitest';
import { normalizeURL, getURLsFromHTML, getHTML } from './crawl.js';

describe('normalizeURL', () => {
    it('should remove the protocol from the URL', () => {
        const url = 'https://blog.example.com/path';
        const expected = 'blog.example.com/path';
        const normalized = normalizeURL(url);
        expect(normalized).toBe(expected);
    });

    it('should normalize a URL with a trailing slash', () => {
        const url = 'https://blog.example.com/path/';
        const expected = 'blog.example.com/path';
        const normalized = normalizeURL(url);
        expect(normalized).toBe(expected);
    });

    it('should normalize a URL with a query string', () => {
        const url = 'https://blog.example.com/path?query=string';
        const expected = 'blog.example.com/path';
        const normalized = normalizeURL(url);
        expect(normalized).toBe(expected);
    });

    it('should normalize a URL with a fragment', () => {
        const url = 'https://blog.example.com/path#fragment';
        const expected = 'blog.example.com/path';
        const normalized = normalizeURL(url);
        expect(normalized).toBe(expected);
    });

    it('should normalize a URL with a port number', () => {
        const url = 'https://blog.example.com:8080/path';
        const expected = 'blog.example.com:8080/path';
        const normalized = normalizeURL(url);
        expect(normalized).toBe(expected);
    });

    it('should normalize without the subdomain', () => {
        const url = 'https://example.com/path';
        const expected = 'example.com/path';
        const normalized = normalizeURL(url);
        expect(normalized).toBe(expected);
    });

    it('should normalize a URL with any protocol', () => {
        const url = 'ftp://example.com/path';
        const expected = 'example.com/path';
        const normalized = normalizeURL(url);
        expect(normalized).toBe(expected);
    });

    it('should throw an error for invalid URLs', () => {
        const url = 'invalid-url';
        expect(() => normalizeURL(url)).toThrow();
    });

    it('should handle URLs with special characters', () => {
        const url = 'https://example.com/path?query=string&name=John Doe';
        const expected = 'example.com/path';
        const normalized = normalizeURL(url);
        expect(normalized).toBe(expected);
    });

    it('should handle URLs with encoded characters', () => {
        const url = 'https://example.com/path?query=string%20with%20spaces';
        const expected = 'example.com/path';
        const normalized = normalizeURL(url);
        expect(normalized).toBe(expected);
    });
});

describe('getURLsFromHTML', () => {
    it('should extract URLs from HTML', () => {
        const html = `
            <html>
                <body>
                    <a href="https://example.com/path">Link</a>
                    <a href="https://example.com/another-path">Another Link</a>
                </body>
            </html>
        `;
        const baseURL = 'https://example.com';
        const expected = ['https://example.com/path', 'https://example.com/another-path'];
        const urls = getURLsFromHTML(html, baseURL);
        expect(urls).toEqual(expected);
    });

    it('should handle relative URLs', () => {
        const html = `
            <html>
                <body>
                    <a href="/path">Link</a>
                    <a href="another-path">Another Link</a>
                </body>
            </html>
        `;
        const baseURL = 'https://example.com';
        const expected = ['https://example.com/path', 'https://example.com/another-path'];
        const urls = getURLsFromHTML(html, baseURL);
        expect(urls).toEqual(expected);
    });

    it('should handle invalid HTML', () => {
        const html = '<html><body><a href="https://invalid-url/"></body></html>';
        const baseURL = 'https://example.com';
        const expected: string[] = [];
        const urls = getURLsFromHTML(html, baseURL);
        expect(urls).toEqual(expected);
    });

    it('should handle empty HTML', () => {
        const html = '';
        const baseURL = 'https://example.com';
        const expected: string[] = [];
        const urls = getURLsFromHTML(html, baseURL);
        expect(urls).toEqual(expected);
    });
});

describe('getHTML', () => {
    it('should fetch HTML from a valid URL', async () => {
        const url = 'https://example.com';
        const html = await getHTML(url);
        expect(html).toBeDefined();
    });

    it('should throw an error for an invalid URL', async () => {
        const url = 'invalid-url';
        await expect(getHTML(url)).rejects.toThrow();
    });

    it('should throw an error for a non-HTML response', async () => {
        const url = 'https://example.com/image.png';
        await expect(getHTML(url)).rejects.toThrow();
    });

    it('should throw an error for a large response', async () => {
        const url = 'https://example.com/large-file';
        await expect(getHTML(url)).rejects.toThrow();
    });
});
