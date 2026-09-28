import { count, eq, max } from "drizzle-orm";
import { db, dbClient } from "../src/db";
import {
  authors,
  chapters,
  genres,
  stories,
  storyGenres,
  storyStatusEnum,
} from "../src/db/schema";

type StoryStatus = (typeof storyStatusEnum.enumValues)[number];

const genreSeeds = [
  ["Tiên Hiệp", "tien-hiep", "Tu luyện, tiên đạo và hành trình vượt qua giới hạn phàm nhân."],
  ["Huyền Huyễn", "huyen-huyen", "Thế giới kỳ ảo với ma pháp, linh thú và những vùng đất chưa được khám phá."],
  ["Kiếm Hiệp", "kiem-hiep", "Giang hồ, võ học và những lựa chọn giữa ân oán với chính nghĩa."],
  ["Đô Thị", "do-thi", "Những câu chuyện diễn ra trong nhịp sống thành thị hiện đại."],
  ["Ngôn Tình", "ngon-tinh", "Tình cảm và hành trình trưởng thành của các nhân vật."],
  ["Trinh Thám", "trinh-tham", "Bí ẩn, manh mối và quá trình tìm ra sự thật."],
  ["Khoa Huyễn", "khoa-huyen", "Khoa học, công nghệ và những khả năng của tương lai."],
  ["Phiêu Lưu", "phieu-luu", "Những chuyến đi qua vùng đất mới cùng nhiều thử thách bất ngờ."],
] as const;

const authorSeeds = [
  {
    name: "Minh Hà",
    slug: "minh-ha",
    description: "Tác giả hư cấu chuyên viết truyện phiêu lưu và kỳ ảo.",
  },
  {
    name: "Lâm Phong",
    slug: "lam-phong",
    description: "Tác giả hư cấu yêu thích không khí giang hồ và các bí ẩn cổ xưa.",
  },
  {
    name: "An Nhiên",
    slug: "an-nhien",
    description: "Tác giả hư cấu viết về thành phố, ký ức và những con người bình dị.",
  },
] as const;

type ChapterSeed = {
  number: string;
  title: string;
  slug: string;
  publishedAt: string;
  content: string;
};

type StorySeed = {
  title: string;
  slug: string;
  description: string;
  authorSlug: string;
  genreSlugs: string[];
  status: StoryStatus;
  viewCount: number;
  publishedAt: string;
  chapters: ChapterSeed[];
};

const storySeeds: StorySeed[] = [
  {
    title: "Kiếm Khách Dưới Trăng",
    slug: "kiem-khach-duoi-trang",
    description: "Một kiếm khách trẻ lần theo dấu vết của thanh cổ kiếm thất lạc và phát hiện bí mật có thể thay đổi cả giang hồ.",
    authorSlug: "lam-phong",
    genreSlugs: ["kiem-hiep", "phieu-luu"],
    status: "ONGOING",
    viewCount: 1280,
    publishedAt: "2026-08-18T01:00:00.000Z",
    chapters: [
      {
        number: "1",
        title: "Người lạ ở bến sông",
        slug: "nguoi-la-o-ben-song",
        publishedAt: "2026-08-18T02:00:00.000Z",
        content: "Mặt sông đêm phẳng như một tấm gương đen. Tạ Vân bước xuống con thuyền cuối cùng, bên hông chỉ có một thanh kiếm gỗ đã sứt mẻ.\n\nNgười chèo thuyền không hỏi tên. Ông chỉ nhìn vết trăng khuyết khắc trên chuôi kiếm rồi lặng lẽ đổi hướng, đưa thuyền về phía bờ lau không có trên bản đồ.\n\nKhi tiếng mái chèo dừng lại, Tạ Vân biết chuyến đi của mình mới thực sự bắt đầu.",
      },
      {
        number: "2",
        title: "Dấu kiếm trên vách đá",
        slug: "dau-kiem-tren-vach-da",
        publishedAt: "2026-08-21T02:00:00.000Z",
        content: "Sau rặng lau là một con đường đá phủ rêu. Trên vách núi, mười ba vết kiếm nối nhau thành hình một cánh chim đang bay.\n\nTạ Vân đặt tay lên đường kiếm cuối cùng. Hơi lạnh xuyên qua đầu ngón tay, kéo theo một ký ức không thuộc về chàng.\n\nTrong ký ức ấy, có người đã chôn thanh cổ kiếm dưới ngọn tháp phía bắc.",
      },
      {
        number: "3",
        title: "Quán trà không biển hiệu",
        slug: "quan-tra-khong-bien-hieu",
        publishedAt: "2026-08-25T02:00:00.000Z",
        content: "Quán trà nằm giữa hai con hẻm nhưng không có cửa ra vào. Khách muốn bước vào phải gõ ba lần lên bức tường gạch cũ.\n\nBên trong, một cô gái áo xanh đã chờ sẵn. Nàng đẩy về phía Tạ Vân nửa mảnh bản đồ và nói rằng nửa còn lại đang ở trong tay kẻ muốn giết chàng.\n\nNgoài ngõ, tiếng vỏ kiếm chạm nhau vang lên rất khẽ.",
      },
      {
        number: "4",
        title: "Trận mưa đầu thu",
        slug: "tran-mua-dau-thu",
        publishedAt: "2026-09-02T02:00:00.000Z",
        content: "Mưa đầu thu trút xuống mái ngói khi ba bóng đen bao vây quán trà. Tạ Vân không rút kiếm, chỉ dùng chiếc đũa tre gạt lệch mũi ám khí đầu tiên.\n\nCô gái áo xanh phá cửa sổ, dẫn chàng chạy qua những mái nhà nối tiếp. Phía sau họ, ngọn lửa bùng lên giữa màn mưa.\n\nNửa mảnh bản đồ trong tay Tạ Vân hiện dần một dòng chữ đỏ: Đừng tin người giữ tháp.",
      },
    ],
  },
  {
    title: "Tiệm Sách Lúc Nửa Đêm",
    slug: "tiem-sach-luc-nua-dem",
    description: "Một tiệm sách chỉ mở sau nửa đêm, nơi mỗi cuốn sách cũ lưu giữ một bí mật chưa được giải đáp của thành phố.",
    authorSlug: "an-nhien",
    genreSlugs: ["do-thi", "trinh-tham"],
    status: "ONGOING",
    viewCount: 940,
    publishedAt: "2026-08-22T01:00:00.000Z",
    chapters: [
      {
        number: "1",
        title: "Cánh cửa sau tiếng chuông",
        slug: "canh-cua-sau-tieng-chuong",
        publishedAt: "2026-08-22T02:00:00.000Z",
        content: "Đúng mười hai giờ, tiếng chuông nhà thờ vang lên giữa cơn mưa. Vy nhìn thấy một cánh cửa gỗ xuất hiện ở bức tường vốn chỉ toàn dây leo.\n\nTấm biển nhỏ ghi Tiệm Sách Mộc Miên. Bên trong không có người bán, chỉ có một cuốn sổ mở sẵn với tên cô trên trang đầu tiên.\n\nDưới cái tên là câu hỏi: Bạn muốn tìm người mất tích hay tìm sự thật?",
      },
      {
        number: "2",
        title: "Cuốn sách không có trang cuối",
        slug: "cuon-sach-khong-co-trang-cuoi",
        publishedAt: "2026-08-27T02:00:00.000Z",
        content: "Cuốn sách bìa xám kể lại đúng ngày anh trai Vy biến mất. Mỗi chi tiết đều chính xác, trừ việc người kể chuyện đứng ở phía bên kia con phố.\n\nVy lật đến cuối nhưng trang sau cùng đã bị xé. Một mẩu giấy kẹp trong gáy sách chỉ đến ga tàu bỏ hoang phía đông.\n\nKhi cô ngẩng đầu, chiếc đồng hồ trong tiệm đã chạy ngược mười phút.",
      },
      {
        number: "3",
        title: "Sân ga số không",
        slug: "san-ga-so-khong",
        publishedAt: "2026-09-04T02:00:00.000Z",
        content: "Ga tàu phía đông đã đóng cửa mười năm, nhưng bảng điện vẫn hiện một chuyến tàu không có điểm đến. Vy bước qua hàng rào đúng lúc đèn sân ga bật sáng.\n\nTrên ghế chờ là chiếc máy ảnh cũ của anh trai cô. Tấm ảnh cuối cùng chụp chính tiệm sách, vào một đêm cách đây hai mươi năm.\n\nỞ góc ảnh, người chủ tiệm có khuôn mặt giống hệt Vy.",
      },
      {
        number: "4",
        title: "Người giữ chìa khóa",
        slug: "nguoi-giu-chia-khoa",
        publishedAt: "2026-09-11T02:00:00.000Z",
        content: "Người gác ga trao cho Vy một chiếc chìa khóa bằng đồng. Ông nói nó chỉ mở được cánh cửa mà chủ nhân thật sự muốn quên.\n\nVy trở lại tiệm sách trước nửa đêm. Lần này, cuối hành lang xuất hiện một căn phòng khóa kín.\n\nTừ phía sau cánh cửa, giọng anh trai cô gọi tên cô rất rõ.",
      },
    ],
  },
  {
    title: "Mưa Trên Thành Phố Cũ",
    slug: "mua-tren-thanh-pho-cu",
    description: "Hai người bạn cũ gặp lại trong mùa mưa và cùng hoàn thành danh sách những điều còn dang dở của tuổi trẻ.",
    authorSlug: "an-nhien",
    genreSlugs: ["do-thi", "ngon-tinh"],
    status: "COMPLETED",
    viewCount: 2120,
    publishedAt: "2026-07-10T01:00:00.000Z",
    chapters: [
      {
        number: "1",
        title: "Chiếc ô màu vàng",
        slug: "chiec-o-mau-vang",
        publishedAt: "2026-07-10T02:00:00.000Z",
        content: "Mai gặp Khải dưới mái hiên của rạp chiếu phim cũ. Mười năm trôi qua, anh vẫn cầm chiếc ô màu vàng từng bị cả lớp trêu chọc.\n\nHọ chào nhau như hai người mới quen, rồi cùng bật cười khi cơn mưa bất ngờ hắt ướt cả hai.\n\nTrong túi áo Khải là danh sách mười điều họ đã viết vào mùa hè cuối cấp.",
      },
      {
        number: "2",
        title: "Con đường có hàng me",
        slug: "con-duong-co-hang-me",
        publishedAt: "2026-07-14T02:00:00.000Z",
        content: "Điều đầu tiên trong danh sách là đạp xe hết con đường có hàng me trước khi trời tối. Thành phố đã thay đổi, nhưng bóng cây vẫn đổ dài như ngày cũ.\n\nMai kể về những nơi cô đã đi. Khải kể về quán cà phê nhỏ anh sắp đóng cửa.\n\nKhông ai nhắc đến lá thư chưa từng được gửi.",
      },
      {
        number: "3",
        title: "Bản nhạc còn thiếu",
        slug: "ban-nhac-con-thieu",
        publishedAt: "2026-07-19T02:00:00.000Z",
        content: "Họ tìm thấy cây đàn cũ trong phòng nhạc của trường. Một phím đàn đã hỏng, khiến bản nhạc năm xưa luôn thiếu đúng một nốt.\n\nMai ngồi xuống chơi lại từ đầu. Khải dùng ngón tay gõ nốt còn thiếu lên thành đàn.\n\nNgoài cửa sổ, mưa ngừng rơi lần đầu tiên trong nhiều ngày.",
      },
      {
        number: "4",
        title: "Ngày trời trong",
        slug: "ngay-troi-trong",
        publishedAt: "2026-07-25T02:00:00.000Z",
        content: "Điều cuối cùng trong danh sách chỉ có bốn chữ: Thành thật với nhau. Mai đặt lá thư cũ lên bàn, còn Khải mở cánh cửa quán cà phê vừa được sơn lại.\n\nHọ không hứa sẽ bù lại mười năm đã mất. Họ chỉ hẹn gặp nhau vào sáng hôm sau, khi thành phố vừa thức dậy.\n\nTrên con đường còn ướt, chiếc ô màu vàng được gấp lại dưới một bầu trời trong xanh.",
      },
    ],
  },
  {
    title: "Trạm Quan Sát Thiên Hà",
    slug: "tram-quan-sat-thien-ha",
    description: "Phi hành đoàn cuối cùng của một trạm quan sát xa xôi nhận được tín hiệu gửi từ Trái Đất trong tương lai.",
    authorSlug: "minh-ha",
    genreSlugs: ["khoa-huyen", "phieu-luu"],
    status: "HIATUS",
    viewCount: 760,
    publishedAt: "2026-08-30T01:00:00.000Z",
    chapters: [
      {
        number: "1",
        title: "Tín hiệu thứ mười ba",
        slug: "tin-hieu-thu-muoi-ba",
        publishedAt: "2026-08-30T02:00:00.000Z",
        content: "Trạm Thiên Hà số Bảy đã im lặng suốt bốn trăm ngày. Đến ca trực của Linh, ăng-ten chính bất ngờ nhận được tín hiệu thứ mười ba.\n\nTín hiệu mang mã xác thực của Trái Đất nhưng dấu thời gian lại nằm ở ba mươi hai năm trong tương lai.\n\nThông điệp chỉ có một câu: Đừng để trạm quan sát nhìn thấy ngôi sao màu xanh.",
      },
      {
        number: "2",
        title: "Quỹ đạo bị lãng quên",
        slug: "quy-dao-bi-lang-quen",
        publishedAt: "2026-09-03T02:00:00.000Z",
        content: "Dữ liệu cũ cho thấy trạm từng thay đổi quỹ đạo, nhưng toàn bộ nhật ký của ngày hôm đó đã bị xóa. Linh và kỹ sư Nam mở khoang điều khiển dự phòng.\n\nTrong bộ nhớ cơ học, họ tìm thấy bản đồ dẫn đến một vệ tinh không còn xuất hiện trên hệ thống.\n\nVệ tinh ấy vẫn phát sáng ở khoảng không phía trước.",
      },
      {
        number: "3",
        title: "Ngôi sao màu xanh",
        slug: "ngoi-sao-mau-xanh",
        publishedAt: "2026-09-09T02:00:00.000Z",
        content: "Qua kính quan sát, ngôi sao màu xanh trông nhỏ như một giọt nước. Nhưng mỗi lần máy tính đo khoảng cách, nó lại gần hơn hàng triệu kilômét.\n\nNam cho rằng thứ họ nhìn thấy không phải một ngôi sao mà là một hình ảnh được gửi ngược qua thời gian.\n\nRồi hệ thống phát thông báo: Khoảng cách đến mục tiêu bằng không.",
      },
      {
        number: "4",
        title: "Căn phòng ngoài bản thiết kế",
        slug: "can-phong-ngoai-ban-thiet-ke",
        publishedAt: "2026-09-16T02:00:00.000Z",
        content: "Một cánh cửa xuất hiện giữa hành lang vốn chỉ có tường kín. Phía sau là căn phòng không nằm trong bất kỳ bản thiết kế nào của trạm.\n\nGiữa phòng đặt một máy phát tín hiệu giống hệt thiết bị Linh đang sử dụng, phủ bụi của nhiều thập kỷ.\n\nMàn hình máy phát sáng lên và hiển thị tên người gửi: Linh, ba mươi hai năm sau.",
      },
    ],
  },
];

function countWords(content: string) {
  return content.trim().split(/\s+/u).length;
}

async function seed() {
  await db.transaction(async (transaction) => {
    const genreIds = new Map<string, string>();
    const authorIds = new Map<string, string>();

    for (const [name, slug, description] of genreSeeds) {
      const [genre] = await transaction
        .insert(genres)
        .values({ name, slug, description })
        .onConflictDoUpdate({
          target: genres.slug,
          set: { name, description },
        })
        .returning({ id: genres.id });

      genreIds.set(slug, genre.id);
    }

    for (const authorSeed of authorSeeds) {
      const [author] = await transaction
        .insert(authors)
        .values(authorSeed)
        .onConflictDoUpdate({
          target: authors.slug,
          set: {
            name: authorSeed.name,
            description: authorSeed.description,
            updatedAt: new Date(),
          },
        })
        .returning({ id: authors.id });

      authorIds.set(authorSeed.slug, author.id);
    }

    for (const storySeed of storySeeds) {
      const authorId = authorIds.get(storySeed.authorSlug);

      if (!authorId) {
        throw new Error(`Missing seeded author: ${storySeed.authorSlug}`);
      }

      const publishedAt = new Date(storySeed.publishedAt);
      const [story] = await transaction
        .insert(stories)
        .values({
          title: storySeed.title,
          slug: storySeed.slug,
          description: storySeed.description,
          authorId,
          status: storySeed.status,
          viewCount: storySeed.viewCount,
          isPublished: true,
          publishedAt,
          latestChapterAt: publishedAt,
        })
        .onConflictDoUpdate({
          target: stories.slug,
          set: {
            title: storySeed.title,
            description: storySeed.description,
            authorId,
            status: storySeed.status,
            viewCount: storySeed.viewCount,
            isPublished: true,
            publishedAt,
            updatedAt: new Date(),
          },
        })
        .returning({ id: stories.id });

      for (const genreSlug of storySeed.genreSlugs) {
        const genreId = genreIds.get(genreSlug);

        if (!genreId) {
          throw new Error(`Missing seeded genre: ${genreSlug}`);
        }

        await transaction
          .insert(storyGenres)
          .values({ storyId: story.id, genreId })
          .onConflictDoNothing();
      }

      for (const chapterSeed of storySeed.chapters) {
        const chapterPublishedAt = new Date(chapterSeed.publishedAt);

        await transaction
          .insert(chapters)
          .values({
            storyId: story.id,
            chapterNumber: chapterSeed.number,
            title: chapterSeed.title,
            slug: chapterSeed.slug,
            content: chapterSeed.content,
            wordCount: countWords(chapterSeed.content),
            isPublished: true,
            publishedAt: chapterPublishedAt,
          })
          .onConflictDoUpdate({
            target: [chapters.storyId, chapters.chapterNumber],
            set: {
              title: chapterSeed.title,
              slug: chapterSeed.slug,
              content: chapterSeed.content,
              wordCount: countWords(chapterSeed.content),
              isPublished: true,
              publishedAt: chapterPublishedAt,
              updatedAt: new Date(),
            },
          });
      }

      const [chapterStats] = await transaction
        .select({
          total: count(chapters.id),
          latestPublishedAt: max(chapters.publishedAt),
        })
        .from(chapters)
        .where(eq(chapters.storyId, story.id));

      await transaction
        .update(stories)
        .set({
          totalChapters: chapterStats.total,
          latestChapterAt: chapterStats.latestPublishedAt,
          updatedAt: new Date(),
        })
        .where(eq(stories.id, story.id));
    }
  });

  const [authorCount] = await db.select({ value: count(authors.id) }).from(authors);
  const [genreCount] = await db.select({ value: count(genres.id) }).from(genres);
  const [storyCount] = await db.select({ value: count(stories.id) }).from(stories);
  const [chapterCount] = await db.select({ value: count(chapters.id) }).from(chapters);

  console.log("Seed completed");
  console.log(`Authors: ${authorCount.value}`);
  console.log(`Genres: ${genreCount.value}`);
  console.log(`Stories: ${storyCount.value}`);
  console.log(`Chapters: ${chapterCount.value}`);
}

async function main() {
  try {
    await seed();
  } catch (error) {
    console.error("Seed failed");
    console.error(error instanceof Error ? error.message : "Unknown error");
    process.exitCode = 1;
  } finally {
    await dbClient.end({ timeout: 5 });
  }
}

void main();
