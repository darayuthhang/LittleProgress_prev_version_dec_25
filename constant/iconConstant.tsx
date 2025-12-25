// export const iconCategoryConstant: Record<string, string> = {
//   technology: "@/asset/icons/technology.png",
//   business: "@/asset/icons/business.png",
//   design: "@/asset/icons/design.png",
//   marketing: "@/asset/icons/marketing.png",
//   finance: "@/asset/icons/finance.png",
//   legal: "@/asset/icons/legal.png",
//   healthcare: "@/asset/icons/healthcare.png",
//   engineer: "@/asset/icons/engineer.png",
//   education: "@/asset/icons/education.png",
//   science: "@/asset/icons/science.png",
//   government: "@/asset/icons/government.png",
//   social: "@/asset/icons/social.png",
//   hospitality: "@/asset/icons/hospitality.png",
//   fitness: "@/asset/icons/fitness.png",
//   construction: "@/asset/icons/construction.png",
// };
export const mainIconImage = require("@/assets/icons/little-progress.png");

// export const mainIconImage = require("@/assets/icons/main-icon.png");
export const iconCategoryConstant = {
  default: require("@/assets/icons/default.png"),
  technology: require("@/assets/icons/technology.png"),
  business: require("@/assets/icons/business.png"),
  design: require("@/assets/icons/design.png"),
  marketing: require("@/assets/icons/marketing.png"),
  finance: require("@/assets/icons/finance.png"),
  legal: require("@/assets/icons/legal.png"),
  healthcare: require("@/assets/icons/healthcare.png"),
  engineer: require("@/assets/icons/engineer.png"),
  education: require("@/assets/icons/education.png"),
  science: require("@/assets/icons/science.png"),
  government: require("@/assets/icons/government.png"),
  social: require("@/assets/icons/social.png"),
  hospitality: require("@/assets/icons/hospitality.png"),
  fitness: require("@/assets/icons/fitness.png"),
  construction: require("@/assets/icons/construction.png"),

  drinkWater: require("@/assets/icons/daily_life/drink-water.png"),
  eating: require("@/assets/icons/daily_life/eating.png"),
  mediation: require("@/assets/icons/daily_life/mediation.png"),
  sleep: require("@/assets/icons/daily_life/sleep.png"),
  walk: require("@/assets/icons/daily_life/walk.png"),
  //home - family
  careForPet: require("@/assets/icons/daily_life/home_family/care-for-pets.png"),
  clean: require("@/assets/icons/daily_life/home_family/clean.png"),
  cook: require("@/assets/icons/daily_life/home_family/cook.png"),
  laundry: require("@/assets/icons/daily_life/home_family/laundry.png"),
  spendTimeHome: require("@/assets/icons/daily_life/home_family/spend-time-home.png"),

  //work-study
  study: require("@/assets/icons/daily_life/work_study/study.png"),
  learn: require("@/assets/icons/daily_life/work_study/learn.png"),
  manage_time: require("@/assets/icons/daily_life/work_study/manage_time.png"),
  writing: require("@/assets/icons/daily_life/work_study/writing.png"),

  //❤️ Social & Relationship
  small_win: require("@/assets/icons/daily_life/social_relationship/small_win.png"),
  //❤️ hobbies
  listen_music: require("@/assets/icons/daily_life/hobbies/listen_music.png"),
  //❤️ finance_career
  budget: require("@/assets/icons/daily_life/finance_career/budget.png"),
  pay_bill: require("@/assets/icons/daily_life/finance_career/pay_bill.png"),
} as const;
export type CategoryKey = keyof typeof iconCategoryConstant;

export const iconCategoryShortGoalConstant = {
  default: require("@/assets/icons/default.png"),

    drinkWater: require("@/assets/icons/daily_life/drink-water.png"),
      learn: require("@/assets/icons/daily_life/work_study/learn.png"),

  mediation: require("@/assets/icons/daily_life/mediation.png"),
  sleep: require("@/assets/icons/daily_life/sleep.png"),
  walk: require("@/assets/icons/daily_life/walk.png"),
    fitness: require("@/assets/icons/fitness.png"),
      study: require("@/assets/icons/daily_life/work_study/study.png"),
  eating: require("@/assets/icons/daily_life/eating.png"),

  //home - family
  clean: require("@/assets/icons/daily_life/home_family/clean.png"),
  cook: require("@/assets/icons/daily_life/home_family/cook.png"),
  laundry: require("@/assets/icons/daily_life/home_family/laundry.png"),
  spendTimeHome: require("@/assets/icons/daily_life/home_family/spend-time-home.png"),

  //work-study
  manage_time: require("@/assets/icons/daily_life/work_study/manage_time.png"),
  writing: require("@/assets/icons/daily_life/work_study/writing.png"),
  careForPet: require("@/assets/icons/daily_life/home_family/care-for-pets.png"),

  //❤️ Social & Relationship
  small_win: require("@/assets/icons/daily_life/social_relationship/small_win.png"),
  //❤️ hobbies
  listen_music: require("@/assets/icons/daily_life/hobbies/listen_music.png"),
  //❤️ finance_career
  budget: require("@/assets/icons/daily_life/finance_career/budget.png"),
  pay_bill: require("@/assets/icons/daily_life/finance_career/pay_bill.png"),


  technology: require("@/assets/icons/technology.png"),
  business: require("@/assets/icons/business.png"),
  design: require("@/assets/icons/design.png"),
  marketing: require("@/assets/icons/marketing.png"),
  finance: require("@/assets/icons/finance.png"),
  legal: require("@/assets/icons/legal.png"),
  healthcare: require("@/assets/icons/healthcare.png"),
  engineer: require("@/assets/icons/engineer.png"),
  education: require("@/assets/icons/education.png"),
  science: require("@/assets/icons/science.png"),
  government: require("@/assets/icons/government.png"),
  social: require("@/assets/icons/social.png"),
  hospitality: require("@/assets/icons/hospitality.png"),

  construction: require("@/assets/icons/construction.png"),


} as const;
export type CategoryShortGoalKey = keyof typeof iconCategoryShortGoalConstant;
