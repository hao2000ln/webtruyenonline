import assert from "node:assert/strict";
import { getHomepageStories, getStoryDetail, getStoryChaptersBySlug, getChapterForReader } from "../src/db/queries/stories";
import { getGenresWithStoryCounts, getStoriesByGenre, searchPublishedStories } from "../src/db/queries/discovery";
import sitemap from "../src/app/sitemap";
import robots from "../src/app/robots";
import { dbClient } from "../src/db/index";

async function runRouteAudit() {
  console.log("=== BẮT ĐẦU RÀ SOÁT TẤT CẢ CÁC ĐƯỜNG DẪN (ROUTES) ===");

  // 1. Robots.txt
  console.log("\n1. Kiểm tra /robots.txt:");
  const robotsConfig = robots();
  assert.ok(robotsConfig.sitemap, "Robots phải chứa link sitemap");
  assert.ok(robotsConfig.rules, "Robots phải có rules");
  console.log("   -> OK! Sitemap link:", robotsConfig.sitemap);

  // 2. Sitemap.xml
  console.log("\n2. Kiểm tra /sitemap.xml:");
  const sitemapEntries = await sitemap();
  assert.ok(sitemapEntries.length > 0, "Sitemap không được rỗng");
  console.log(`   -> OK! Tổng cộng ${sitemapEntries.length} URL trong sitemap`);
  for (const entry of sitemapEntries.slice(0, 5)) {
    console.log(`      * ${entry.url} (priority: ${entry.priority})`);
  }

  // 3. Homepage (/)
  console.log("\n3. Kiểm tra Trang chủ (/):");
  const homeData = await getHomepageStories();
  assert.ok(homeData.latestUpdated, "Homepage phải có latestUpdated");
  assert.ok(homeData.allGenres, "Homepage phải có allGenres");
  console.log(`   -> OK! Có ${homeData.latestUpdated.length} truyện mới cập nhật, ${homeData.allGenres.length} thể loại.`);

  // 4. Thể loại (/the-loai)
  console.log("\n4. Kiểm tra Danh mục thể loại (/the-loai):");
  const genresList = await getGenresWithStoryCounts();
  assert.ok(genresList.length > 0, "Phải có danh sách thể loại");
  console.log(`   -> OK! Có ${genresList.length} thể loại.`);

  // 5. Chi tiết thể loại (/the-loai/[slug])
  console.log("\n5. Kiểm tra Chi tiết thể loại (/the-loai/[slug]):");
  const sampleGenre = genresList[0];
  const genreDetail = await getStoriesByGenre(sampleGenre.slug, 1, "latest");
  assert.ok(genreDetail, `Phải tải được thể loại ${sampleGenre.slug}`);
  console.log(`   -> OK! Thể loại "${sampleGenre.name}" (/the-loai/${sampleGenre.slug}) có ${genreDetail.total} truyện.`);

  // 6. Chi tiết truyện (/truyen/[slug])
  console.log("\n6. Kiểm tra Chi tiết truyện (/truyen/[slug]):");
  const sampleStory = homeData.latestUpdated[0];
  assert.ok(sampleStory, "Cần ít nhất 1 truyện để kiểm tra");
  const storyDetail = await getStoryDetail(sampleStory.slug);
  assert.ok(storyDetail, `Phải tải được truyện ${sampleStory.slug}`);
  console.log(`   -> OK! Truyện "${storyDetail.title}" (/truyen/${storyDetail.slug}) - ${storyDetail.totalChapters} chương.`);

  // 7. Danh sách chương truyện (/truyen/[slug] chapters)
  console.log("\n7. Kiểm tra Danh sách chương (/truyen/[slug]):");
  const chaptersPage1 = await getStoryChaptersBySlug(sampleStory.slug, "", "newest", 1);
  assert.ok(chaptersPage1.chapters.length > 0, "Truyện phải có chương");
  console.log(`   -> OK! Lấy được ${chaptersPage1.chapters.length} chương (Tổng: ${chaptersPage1.total}).`);

  // 8. Đọc chương (/truyen/[slug]/[chapter])
  console.log("\n8. Kiểm tra Trang đọc chương (/truyen/[slug]/chuong-[number]):");
  const sampleChapter = chaptersPage1.chapters[0];
  const chapterNumStr = String(sampleChapter.number);
  const chapterData = await getChapterForReader(sampleStory.slug, chapterNumStr);
  assert.ok(chapterData, `Phải tải được chương ${chapterNumStr}`);
  assert.ok(chapterData.chapter.content, "Chương phải có nội dung văn bản");
  console.log(`   -> OK! Đọc chương ${chapterNumStr}: "${chapterData.chapter.title}" - ${chapterData.chapter.wordCount} từ.`);

  // 9. Tìm kiếm (/tim-kiem)
  console.log("\n9. Kiểm tra Tìm kiếm (/tim-kiem):");
  const searchResult = await searchPublishedStories("thành phố", 1);
  assert.ok(searchResult.stories, "Tìm kiếm phải trả về mảng kết quả");
  console.log(`   -> OK! Tìm kiếm từ khóa "thành phố" trả về ${searchResult.total} kết quả.`);

  // 10. Kiểm tra định dạng URL trong sitemap có chuẩn SEO không
  console.log("\n10. Kiểm tra cấu trúc URL trong sitemap:");
  for (const entry of sitemapEntries) {
    if (entry.url.includes("/chuong-")) {
      assert.match(entry.url, /\/truyen\/[a-z0-9-]+\/chuong-\d+(?:\.\d{1,3})?$/, `URL chương phải chuẩn SEO: ${entry.url}`);
    }
  }
  console.log("   -> OK! 100% URL chương trong Sitemap tuân thủ chuẩn SEO (/truyen/:slug/chuong-:num).");

  console.log("\n=== TẤT CẢ CÁC ĐƯỜNG DẪN ĐỀU HOẠT ĐỘNG HOÀN HẢO VÀ CHUẨN SEO 100%! ===");
}

runRouteAudit()
  .catch((err) => {
    console.error("LỖI RÀ SOÁT ĐƯỜNG DẪN:", err);
    process.exitCode = 1;
  })
  .finally(() => dbClient.end());
