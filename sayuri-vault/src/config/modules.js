/**
 * Định nghĩa cấu hình cho từng mục quản lý.
 * Mỗi module tương ứng với 1 bảng trong Supabase + 1 trang trong sidebar.
 * `icon` là tên Google Material Symbol (xem src/components/Icon.jsx).
 */
export const MODULES = [
  {
    key: 'pixiv_tags',
    table: 'pixiv_tags',
    label: 'Pixiv Tag',
    pluralLabel: 'Pixiv Tags',
    description: 'Danh sách tag tiếng Anh / tiếng Nhật trên Pixiv',
    icon: 'sell',
    color: 'tag',
    searchPlaceholder: 'Tìm theo tag tiếng Anh, tiếng Nhật, ghi chú...',
    fields: [
      { key: 'english_tag', label: 'English Tag', type: 'text', required: true, mono: true },
      { key: 'japanese_tag', label: 'Japanese Tag', type: 'text', mono: true },
      { key: 'note', label: 'Ghi chú', type: 'textarea' },
    ],
  },
  {
    key: 'x_artists',
    table: 'x_artists',
    label: 'X Artist',
    pluralLabel: 'X Artists',
    description: 'Danh sách hoạ sĩ theo dõi trên X (Twitter)',
    icon: 'alternate_email',
    color: 'artist',
    searchPlaceholder: 'Tìm theo username, ghi chú...',
    fields: [
      { key: 'username', label: 'Username', type: 'text', required: true, mono: true, prefix: '@' },
      { key: 'url', label: 'URL', type: 'url' },
      { key: 'note', label: 'Ghi chú', type: 'textarea' },
    ],
  },
  {
    key: 'pixiv_accounts',
    table: 'pixiv_accounts',
    label: 'Pixiv Account',
    pluralLabel: 'Pixiv Accounts',
    description: 'Danh sách tài khoản hoạ sĩ trên Pixiv',
    icon: 'person',
    color: 'account',
    searchPlaceholder: 'Tìm theo tên, username, ghi chú...',
    fields: [
      { key: 'name', label: 'Tên', type: 'text', required: true },
      { key: 'username', label: 'Username', type: 'text', mono: true },
      { key: 'url', label: 'URL', type: 'url' },
      { key: 'note', label: 'Ghi chú', type: 'textarea' },
    ],
  },
  {
    key: 'pixai_loras',
    table: 'pixai_loras',
    label: 'PixAI Lora',
    pluralLabel: 'PixAI Loras',
    description: 'Danh sách Lora sử dụng trên PixAI',
    icon: 'auto_awesome',
    color: 'lora',
    searchPlaceholder: 'Tìm theo tên lora, ghi chú...',
    fields: [
      { key: 'lora', label: 'Lora', type: 'text', required: true, mono: true },
      { key: 'url', label: 'URL', type: 'url' },
      { key: 'note', label: 'Ghi chú', type: 'textarea' },
    ],
  },
  {
    key: 'danbooru_tag_categories',
    table: 'danbooru_tag_categories',
    label: 'Danbooru Tag Category',
    pluralLabel: 'Danbooru Tag Categories',
    description: 'Danh sách category tag trên Danbooru',
    icon: 'account_tree',
    color: 'dcat',
    searchPlaceholder: 'Tìm theo category, trạng thái, ghi chú...',
    fields: [
      { key: 'category', label: 'Category', type: 'text', required: true, mono: true },
      {
        key: 'status',
        label: 'Trạng thái',
        type: 'select',
        required: true,
        options: ['Active', 'Deprecated', 'Pending Review'],
        default: 'Active',
      },
      { key: 'note', label: 'Ghi chú', type: 'textarea' },
    ],
  },
  {
    key: 'danbooru_tags',
    table: 'danbooru_tags',
    label: 'Danbooru Tag',
    pluralLabel: 'Danbooru Tags',
    description: 'Danh sách tag trên Danbooru theo từng category',
    icon: 'tag',
    color: 'dtag',
    searchPlaceholder: 'Tìm theo tag, category, ghi chú...',
    fields: [
      { key: 'tag', label: 'Tag', type: 'text', required: true, mono: true },
      {
        key: 'category',
        label: 'Category',
        type: 'reference',
        required: true,
        refTable: 'danbooru_tag_categories',
        refField: 'category',
        refLabel: 'Danbooru Tag Category',
      },
      { key: 'url', label: 'URL', type: 'url' },
      { key: 'note', label: 'Ghi chú', type: 'textarea' },
    ],
  },
  {
    key: 'accounts',
    table: 'accounts',
    label: 'Account',
    pluralLabel: 'Accounts',
    description: 'Kho lưu thông tin tài khoản đăng nhập các trang web',
    icon: 'key',
    color: 'vault',
    searchPlaceholder: 'Tìm theo site, username, email, ghi chú...',
    fields: [
      { key: 'site', label: 'Site', type: 'text', required: true },
      { key: 'username', label: 'Username', type: 'text', mono: true },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'password', label: 'Password', type: 'password', mono: true },
      { key: 'note', label: 'Ghi chú', type: 'textarea' },
    ],
  },
  {
    key: 'r34video_artists',
    table: 'r34video_artists',
    label: 'R34Video Artist',
    pluralLabel: 'R34Video Artists',
    description: 'Danh sách hoạ sĩ trên R34Video',
    icon: 'movie',
    color: 'r34',
    searchPlaceholder: 'Tìm theo artist, ghi chú...',
    fields: [
      { key: 'artist', label: 'Artist', type: 'text', required: true },
      { key: 'note', label: 'Ghi chú', type: 'textarea' },
      { key: 'url', label: 'URL', type: 'url' },
    ],
  },
]

export const getModuleByKey = (key) => MODULES.find((m) => m.key === key)

// Hue màu + số múi hình "cookie" cho từng module (Material 3 Expressive)
export const STYLE = {
  accounts: { h: 20, l: 7 }, danbooru_tags: { h: 255, l: 9 }, danbooru_tag_categories: { h: 300, l: 6 },
  pixiv_tags: { h: 200, l: 8 }, pixiv_accounts: { h: 230, l: 10 }, x_artists: { h: 150, l: 5 },
  pixai_loras: { h: 340, l: 12 }, r34video_artists: { h: 75, l: 11 },
}
