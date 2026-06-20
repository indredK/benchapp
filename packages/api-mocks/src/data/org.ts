export interface OrgDepartment {
  id: string;
  name: string;
  parentId: string | null;
  memberCount: number;
}

export interface OrgMember {
  id: string;
  name: string;
  departmentId: string;
  role: string;
  avatar: string;
  email?: string;
  phone?: string;
}

export const mockDepartments: OrgDepartment[] = [
  // 一级部门
  { id: 'd1', name: 'CEO办公室', parentId: null, memberCount: 3 },
  { id: 'd2', name: '技术中心', parentId: null, memberCount: 27 },
  { id: 'd3', name: '产品与设计中心', parentId: null, memberCount: 11 },
  { id: 'd4', name: '市场运营部', parentId: null, memberCount: 7 },
  { id: 'd5', name: '人事行政部', parentId: null, memberCount: 3 },

  // 技术中心子部门
  { id: 'd21', name: '前端开发组', parentId: 'd2', memberCount: 12 },
  { id: 'd22', name: '后端开发组', parentId: 'd2', memberCount: 7 },
  { id: 'd23', name: '质量保障组', parentId: 'd2', memberCount: 3 },
  { id: 'd24', name: '基础架构组', parentId: 'd2', memberCount: 2 },

  // 前端开发组子组（3层深度）
  { id: 'd211', name: 'Web 应用组', parentId: 'd21', memberCount: 6 },
  { id: 'd212', name: '移动端组', parentId: 'd21', memberCount: 4 },
  { id: 'd213', name: '小程序组', parentId: 'd21', memberCount: 2 },

  // 产品与设计子部门
  { id: 'd31', name: '产品组', parentId: 'd3', memberCount: 5 },
  { id: 'd32', name: 'UI 设计组', parentId: 'd3', memberCount: 4 },
  { id: 'd33', name: 'UX 研究组', parentId: 'd3', memberCount: 2 },

  // 市场运营子部门
  { id: 'd41', name: '品牌推广组', parentId: 'd4', memberCount: 3 },
  { id: 'd42', name: '渠道运营组', parentId: 'd4', memberCount: 2 },
  { id: 'd43', name: '数据分析组', parentId: 'd4', memberCount: 2 },
];

export const mockMembers: OrgMember[] = [
  // CEO办公室
  {
    id: 'm001',
    name: '张伟',
    departmentId: 'd1',
    role: 'CEO',
    avatar: 'https://i.pravatar.cc/150?u=1',
    email: 'zhangwei@example.com',
    phone: '13800001001',
  },
  {
    id: 'm002',
    name: '李婷',
    departmentId: 'd1',
    role: 'CEO助理',
    avatar: 'https://i.pravatar.cc/150?u=2',
    email: 'liting@example.com',
    phone: '13800001002',
  },
  {
    id: 'm003',
    name: '王芳',
    departmentId: 'd1',
    role: '战略总监',
    avatar: 'https://i.pravatar.cc/150?u=3',
    email: 'wangfang@example.com',
    phone: '13800001003',
  },

  // Web 应用组
  {
    id: 'm101',
    name: '陈明',
    departmentId: 'd211',
    role: '前端架构师',
    avatar: 'https://i.pravatar.cc/150?u=11',
    email: 'chenming@example.com',
  },
  {
    id: 'm102',
    name: '刘洋',
    departmentId: 'd211',
    role: '高级前端工程师',
    avatar: 'https://i.pravatar.cc/150?u=12',
    email: 'liuyang@example.com',
  },
  {
    id: 'm103',
    name: '周杰',
    departmentId: 'd211',
    role: '前端工程师',
    avatar: 'https://i.pravatar.cc/150?u=13',
    email: 'zhoujie@example.com',
  },
  {
    id: 'm104',
    name: '吴敏',
    departmentId: 'd211',
    role: '前端工程师',
    avatar: 'https://i.pravatar.cc/150?u=14',
    email: 'wumin@example.com',
  },
  {
    id: 'm105',
    name: '郑爽',
    departmentId: 'd211',
    role: '前端实习生',
    avatar: 'https://i.pravatar.cc/150?u=15',
    email: 'zhengshuang@example.com',
  },
  {
    id: 'm106',
    name: '冯涛',
    departmentId: 'd211',
    role: '前端工程师',
    avatar: 'https://i.pravatar.cc/150?u=16',
    email: 'fengtao@example.com',
  },

  // 移动端组
  {
    id: 'm201',
    name: '赵云',
    departmentId: 'd212',
    role: '移动端负责人',
    avatar: 'https://i.pravatar.cc/150?u=21',
    email: 'zhaoyun@example.com',
  },
  {
    id: 'm202',
    name: '黄丽',
    departmentId: 'd212',
    role: 'iOS 工程师',
    avatar: 'https://i.pravatar.cc/150?u=22',
    email: 'huangli@example.com',
  },
  {
    id: 'm203',
    name: '许强',
    departmentId: 'd212',
    role: 'Android 工程师',
    avatar: 'https://i.pravatar.cc/150?u=23',
    email: 'xuqiang@example.com',
  },
  {
    id: 'm204',
    name: '何静',
    departmentId: 'd212',
    role: 'iOS 工程师',
    avatar: 'https://i.pravatar.cc/150?u=24',
    email: 'hejing@example.com',
  },

  // 小程序组
  {
    id: 'm301',
    name: '林峰',
    departmentId: 'd213',
    role: '小程序负责人',
    avatar: 'https://i.pravatar.cc/150?u=31',
    email: 'linfeng@example.com',
  },
  {
    id: 'm302',
    name: '唐晓',
    departmentId: 'd213',
    role: '小程序工程师',
    avatar: 'https://i.pravatar.cc/150?u=32',
    email: 'tangxiao@example.com',
  },

  // 后端开发组
  {
    id: 'm401',
    name: '孙磊',
    departmentId: 'd22',
    role: '后端架构师',
    avatar: 'https://i.pravatar.cc/150?u=41',
    email: 'sunlei@example.com',
    phone: '13800002001',
  },
  {
    id: 'm402',
    name: '朱峰',
    departmentId: 'd22',
    role: '高级后端工程师',
    avatar: 'https://i.pravatar.cc/150?u=42',
    email: 'zhufeng@example.com',
  },
  {
    id: 'm403',
    name: '马超',
    departmentId: 'd22',
    role: '后端工程师',
    avatar: 'https://i.pravatar.cc/150?u=43',
    email: 'machao@example.com',
  },
  {
    id: 'm404',
    name: '胡兵',
    departmentId: 'd22',
    role: '后端工程师',
    avatar: 'https://i.pravatar.cc/150?u=44',
    email: 'hubing@example.com',
  },
  {
    id: 'm405',
    name: '郭鑫',
    departmentId: 'd22',
    role: '后端工程师',
    avatar: 'https://i.pravatar.cc/150?u=45',
    email: 'guoxin@example.com',
  },
  {
    id: 'm406',
    name: '罗琳',
    departmentId: 'd22',
    role: '后端工程师',
    avatar: 'https://i.pravatar.cc/150?u=46',
    email: 'luolin@example.com',
  },
  {
    id: 'm407',
    name: '梁宇',
    departmentId: 'd22',
    role: 'DevOps 工程师',
    avatar: 'https://i.pravatar.cc/150?u=47',
    email: 'liangyu@example.com',
  },

  // 质量保障组
  {
    id: 'm501',
    name: '高鹏',
    departmentId: 'd23',
    role: '测试负责人',
    avatar: 'https://i.pravatar.cc/150?u=51',
    email: 'gaopeng@example.com',
  },
  {
    id: 'm502',
    name: '谢敏',
    departmentId: 'd23',
    role: '测试工程师',
    avatar: 'https://i.pravatar.cc/150?u=52',
    email: 'xiemin@example.com',
  },
  {
    id: 'm503',
    name: '韩雪',
    departmentId: 'd23',
    role: '自动化测试工程师',
    avatar: 'https://i.pravatar.cc/150?u=53',
    email: 'hanxue@example.com',
  },

  // 基础架构组
  {
    id: 'm601',
    name: '曹磊',
    departmentId: 'd24',
    role: '架构师',
    avatar: 'https://i.pravatar.cc/150?u=61',
    email: 'caolei@example.com',
  },
  {
    id: 'm602',
    name: '田源',
    departmentId: 'd24',
    role: 'SRE 工程师',
    avatar: 'https://i.pravatar.cc/150?u=62',
    email: 'tianyuan@example.com',
  },

  // 产品组
  {
    id: 'm701',
    name: '沈思',
    departmentId: 'd31',
    role: '产品总监',
    avatar: 'https://i.pravatar.cc/150?u=71',
    email: 'shensi@example.com',
  },
  {
    id: 'm702',
    name: '姚敏',
    departmentId: 'd31',
    role: '高级产品经理',
    avatar: 'https://i.pravatar.cc/150?u=72',
    email: 'yaomin@example.com',
  },
  {
    id: 'm703',
    name: '卢新',
    departmentId: 'd31',
    role: '产品经理',
    avatar: 'https://i.pravatar.cc/150?u=73',
    email: 'luxin@example.com',
  },
  {
    id: 'm704',
    name: '邓超',
    departmentId: 'd31',
    role: '产品经理',
    avatar: 'https://i.pravatar.cc/150?u=74',
    email: 'dengchao@example.com',
  },
  {
    id: 'm705',
    name: '彭亮',
    departmentId: 'd31',
    role: '产品助理',
    avatar: 'https://i.pravatar.cc/150?u=75',
    email: 'pengliang@example.com',
  },

  // UI 设计组
  {
    id: 'm801',
    name: '萧然',
    departmentId: 'd32',
    role: '设计总监',
    avatar: 'https://i.pravatar.cc/150?u=81',
    email: 'xiaoran@example.com',
  },
  {
    id: 'm802',
    name: '余敏',
    departmentId: 'd32',
    role: 'UI 设计师',
    avatar: 'https://i.pravatar.cc/150?u=82',
    email: 'yumin@example.com',
  },
  {
    id: 'm803',
    name: '蔡明',
    departmentId: 'd32',
    role: '视觉设计师',
    avatar: 'https://i.pravatar.cc/150?u=83',
    email: 'caiming@example.com',
  },
  {
    id: 'm804',
    name: '潘婷',
    departmentId: 'd32',
    role: '交互设计师',
    avatar: 'https://i.pravatar.cc/150?u=84',
    email: 'panting@example.com',
  },

  // UX 研究组
  {
    id: 'm901',
    name: '丁磊',
    departmentId: 'd33',
    role: 'UX 研究员',
    avatar: 'https://i.pravatar.cc/150?u=91',
    email: 'dinglei@example.com',
  },
  {
    id: 'm902',
    name: '苏琳',
    departmentId: 'd33',
    role: 'UX 研究员',
    avatar: 'https://i.pravatar.cc/150?u=92',
    email: 'sulin@example.com',
  },

  // 品牌推广组
  {
    id: 'ma01',
    name: '蒋涛',
    departmentId: 'd41',
    role: '市场总监',
    avatar: 'https://i.pravatar.cc/150?u=101',
    email: 'jiangtao@example.com',
  },
  {
    id: 'ma02',
    name: '沈洁',
    departmentId: 'd41',
    role: '品牌经理',
    avatar: 'https://i.pravatar.cc/150?u=102',
    email: 'shenjie@example.com',
  },
  {
    id: 'ma03',
    name: '金鑫',
    departmentId: 'd41',
    role: '内容运营',
    avatar: 'https://i.pravatar.cc/150?u=103',
    email: 'jinxin@example.com',
  },

  // 渠道运营组
  {
    id: 'mb01',
    name: '魏然',
    departmentId: 'd42',
    role: '渠道经理',
    avatar: 'https://i.pravatar.cc/150?u=111',
    email: 'weiran@example.com',
  },
  {
    id: 'mb02',
    name: '陶磊',
    departmentId: 'd42',
    role: '商务拓展',
    avatar: 'https://i.pravatar.cc/150?u=112',
    email: 'taolei@example.com',
  },

  // 数据分析组
  {
    id: 'mc01',
    name: '贾明',
    departmentId: 'd43',
    role: '数据分析师',
    avatar: 'https://i.pravatar.cc/150?u=121',
    email: 'jiaming@example.com',
  },
  {
    id: 'mc02',
    name: '薛平',
    departmentId: 'd43',
    role: '数据分析师',
    avatar: 'https://i.pravatar.cc/150?u=122',
    email: 'xueping@example.com',
  },

  // 人事行政部
  {
    id: 'md01',
    name: '程丽',
    departmentId: 'd5',
    role: 'HR 总监',
    avatar: 'https://i.pravatar.cc/150?u=131',
    email: 'chengli@example.com',
  },
  {
    id: 'md02',
    name: '陆飞',
    departmentId: 'd5',
    role: '招聘经理',
    avatar: 'https://i.pravatar.cc/150?u=132',
    email: 'lufei@example.com',
  },
  {
    id: 'md03',
    name: '秦蕾',
    departmentId: 'd5',
    role: '行政主管',
    avatar: 'https://i.pravatar.cc/150?u=133',
    email: 'qinlei@example.com',
  },
];

/** 搜索部门和成员 */
export function searchOrg(keyword: string): { departments: OrgDepartment[]; members: OrgMember[] } {
  const kw = keyword.toLowerCase();
  return {
    departments: mockDepartments.filter((d) => d.name.toLowerCase().includes(kw)),
    members: mockMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(kw) ||
        m.role.toLowerCase().includes(kw) ||
        m.email?.toLowerCase().includes(kw),
    ),
  };
}
