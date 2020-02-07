'use strict'

const _ = require('lodash')
const uuid = require('uuid')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('Person', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */

    const devices = [
      {
        name: 'HERO8 Black',
        slug: 'hero8-black',
        manufacturerSlug: 'gopro',
        url: 'https://gopro.com/en/us/update/hero8-black'
      },
      {
        name: 'MAX',
        slug: 'max',
        manufacturerSlug: 'gopro',
        url: 'https://gopro.com/en/us/update/max'
      },
      {
        name: 'HERO7 Black',
        slug: 'hero7-black',
        manufacturerSlug: 'gopro',
        url: 'https://gopro.com/en/us/update/hero7-black'
      },
      {
        name: 'HERO7 Silver',
        slug: 'hero7-silver',
        manufacturerSlug: 'gopro',
        url: 'https://gopro.com/en/us/update/hero7-silver'
      },
      {
        name: 'HERO7 White',
        slug: 'hero7-white',
        manufacturerSlug: 'gopro',
        url: 'https://gopro.com/en/us/update/hero7-white'
      },
      {
        name: 'Fusion',
        slug: 'fusion',
        manufacturerSlug: 'gopro',
        url: 'https://gopro.com/en/us/update/fusion'
      },
      {
        name: 'HERO6',
        slug: 'hero6',
        manufacturerSlug: 'gopro',
        url: 'https://gopro.com/en/us/update/hero6'
      },
      {
        name: 'HERO5',
        slug: 'hero5',
        manufacturerSlug: 'gopro',
        url: 'https://gopro.com/en/us/update/hero5'
      },
      {
        name: 'HERO 2018',
        slug: 'hero-2018',
        manufacturerSlug: 'gopro',
        url: 'https://gopro.com/en/us/update/hero-2018'
      },
      {
        name: 'HERO5 Session',
        slug: 'hero5_session',
        manufacturerSlug: 'gopro',
        url: 'https://gopro.com/en/us/update/hero5_session'
      },
      {
        name: 'HERO Session',
        slug: 'hero_session',
        manufacturerSlug: 'gopro',
        url: 'https://gopro.com/en/us/update/hero_session'
      },
      {
        name: 'HERO4',
        slug: 'hero4',
        manufacturerSlug: 'gopro',
        url: 'https://gopro.com/en/us/update/hero4'
      },
      {
        name: 'HERO+ LCD',
        slug: 'heroplus_lcd',
        manufacturerSlug: 'gopro',
        url: 'https://gopro.com/en/us/update/heroplus_lcd'
      },
      {
        name: 'HERO+',
        slug: 'heroplus',
        manufacturerSlug: 'gopro',
        url: 'https://gopro.com/en/us/update/heroplus'
      },
      {
        name: 'HERO',
        slug: 'hero',
        manufacturerSlug: 'gopro',
        url: 'https://gopro.com/en/us/update/hero'
      },
      {
        name: 'HERO3+',
        slug: 'hero3_plus',
        manufacturerSlug: 'gopro',
        url: 'https://gopro.com/en/us/update/hero3_plus'
      },
      {
        name: 'HERO3',
        slug: 'hero3',
        manufacturerSlug: 'gopro',
        url: 'https://gopro.com/en/us/update/hero3'
      },
      {
        name: 'HD HERO2',
        slug: 'hdhero2',
        manufacturerSlug: 'gopro',
        url: 'https://gopro.com/en/us/update/hdhero2'
      },
      {
        name: 'Original HD Hero',
        slug: 'original_hdhero',
        manufacturerSlug: 'gopro',
        url: 'https://gopro.com/en/us/update/original_hdhero'
      },
      {
        name: 'EOS-1D',
        slug: 'eos-1d',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/support-dslr/eos-1d/eos-1d?subtab=downloads-firmware'
      },
      {
        name: 'EOS-1D Mark II',
        slug: 'eos-1d-mark-ii',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/support-dslr/eos-1d-mark-ii/eos-1d-mark-ii?subtab=downloads-firmware'
      },
      {
        name: 'EOS-1D Mark II-N',
        slug: 'eos-1d-mark-ii-n',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/support-dslr/eos-1d-mark-ii-n/eos-1d-mark-ii-n?subtab=downloads-firmware'
      },
      {
        name: 'EOS-1D Mark III',
        slug: 'eos-1d-mark-iii',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/support-dslr/eos-1d-mark-iii/eos-1d-mark-iii?subtab=downloads-firmware'
      },
      {
        name: 'EOS-1D Mark IV',
        slug: 'eos-1d-mark-iv',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/support-dslr/eos-1d-mark-iv/eos-1d-mark-iv?subtab=downloads-firmware'
      },
      {
        name: 'EOS-1D X',
        slug: 'eos-1d-x',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/dslr/eos-1d-x?subtab=downloads-firmware'
      },
      {
        name: 'EOS-1D X Mark II',
        slug: 'eos-1d-x-mark-ii',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/dslr/eos-1d-x-mark-ii?subtab=downloads-firmware'
      },
      {
        name: 'EOS-1D X Mark III',
        slug: 'eos-1d-x-mark-iii',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/dslr/eos-1d-x-mark-iii?subtab=downloads-firmware'
      },
      {
        name: 'EOS-1Ds',
        slug: 'eos-1ds',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/support-dslr/eos-1ds/eos-1ds?subtab=downloads-firmware'
      },
      {
        name: 'EOS-1Ds Mark II',
        slug: 'eos-1ds-mark-ii',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/support-dslr/eos-1ds-mark-ii/eos-1ds-mark-ii?subtab=downloads-firmware'
      },
      {
        name: 'EOS-1Ds Mark III',
        slug: 'eos-1ds-mark-iii',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/support-dslr/eos-1ds-mark-iii/eos-1ds-mark-iii?subtab=downloads-firmware'
      },
      {
        name: 'EOS 5D',
        slug: 'eos-5d',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/support-dslr/eos-5d/eos-5d?subtab=downloads-firmware'
      },
      {
        name: 'EOS 5D Mark I',
        slug: 'eos-5d-mark-ii',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/support-dslr/eos-5d-mark-ii/eos-5d-mark-ii?subtab=downloads-firmware'
      },
      {
        name: 'EOS 5D Mark III',
        slug: 'eos-5d-mark-iii',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/dslr/eos-5d-mark-iii?subtab=downloads-firmware'
      },
      {
        name: 'EOS 5D Mark IV',
        slug: 'eos-5d-mark-iv',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/dslr/eos-5d-mark-iv?subtab=downloads-firmware'
      },
      {
        name: 'EOS 5DS',
        slug: 'eos-5ds',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/dslr/eos-5ds?subtab=downloads-firmware'
      },
      {
        name: 'EOS 5DS R',
        slug: 'eos-5ds-r',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/dslr/eos-5ds-r?subtab=downloads-firmware'
      },
      {
        name: 'EOS 6D',
        slug: 'eos-6d',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/dslr/eos-6d?subtab=downloads-firmware'
      },
      {
        name: 'EOS 6D Mark II',
        slug: 'eos-6d-mark-ii',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/dslr/eos-6d-mark-ii?subtab=downloads-firmware'
      },
      {
        name: 'EOS 7D',
        slug: 'eos-7d',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/dslr/eos-7d/eos-7d?subtab=downloads-firmware'
      },
      {
        name: 'EOS 7D Mark II',
        slug: 'eos-7d-mark-ii',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/dslr/eos-7d-mark-ii?subtab=downloads-firmware'
      },
      {
        name: 'EOS 10D',
        slug: 'eos-10d',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/support-dslr/eos-10d/eos-10d?subtab=downloads-firmware'
      },
      {
        name: 'EOS 20D',
        slug: 'eos-20d',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/support-dslr/eos-20d/eos-20d?subtab=downloads-firmware'
      },
      {
        name: 'EOS 20Da',
        slug: 'eos-20da',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/support-dslr/eos-20da/eos-20da?subtab=downloads-firmware'
      },
      {
        name: 'EOS 30D',
        slug: 'eos-30d',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/support-dslr/eos-30d/eos-30d?subtab=downloads-firmware'
      },
      {
        name: 'EOS 40D',
        slug: 'eos-40d',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/support-dslr/eos-40d/eos-40d?subtab=downloads-firmware'
      },
      {
        name: 'EOS 50D',
        slug: 'eos-50d',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/support-dslr/eos-50d/eos-50d?subtab=downloads-firmware'
      },
      {
        name: 'EOS 60D',
        slug: 'eos-60d',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/dslr/eos-60d/eos-60d?subtab=downloads-firmware'
      },
      {
        name: 'EOS 60Da',
        slug: 'eos-60da',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/dslr/eos-60da/eos-60da?subtab=downloads-firmware'
      },
      {
        name: 'EOS 70D',
        slug: 'eos-70d',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/dslr/eos-70d?subtab=downloads-firmware'
      },
      {
        name: 'EOS 77D',
        slug: 'eos-77d',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/dslr/eos-77d?subtab=downloads-firmware'
      },
      {
        name: 'EOS 80D',
        slug: 'eos-80d',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/dslr/eos-80d?subtab=downloads-firmware'
      },
      {
        name: 'EOS 90D',
        slug: 'eos-90d-body',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/dslr/eos-90d-body?subtab=downloads-firmware'
      },
      {
        name: 'EOS D30',
        slug: 'eos-d30',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/support-dslr/eos-d30/eos-d30?subtab=downloads-firmware'
      },
      {
        name: 'EOS D60',
        slug: 'eos-d60',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/support-dslr/eos-d60/eos-d60?subtab=downloads-firmware'
      },
      {
        name: 'EOS M',
        slug: 'eos-m-ef-m-22mm-stm-kit',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/support-dslr/eos-m-ef-m-22mm-stm-kit/eos-m-ef-m-22mm-stm-kit?subtab=downloads-firmware'
      },
      {
        name: 'EOS M3',
        slug: 'eos-m3-ef-m-18-55mm-is-stm-kit',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/mirrorless/eos-m3-ef-m-18-55mm-is-stm-kit?subtab=downloads-firmware'
      },
      {
        name: 'EOS M5',
        slug: 'eos-m5-ef-m-18-150mm-is-stm',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/mirrorless/eos-m5-ef-m-18-150mm-is-stm?subtab=downloads-firmware'
      },
      {
        name: 'EOS M6',
        slug: 'eos-m6-ef-m-15-45mm-is-stm-kit',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/mirrorless/eos-m6-ef-m-15-45mm-is-stm-kit?subtab=downloads-firmware'
      },
      {
        name: 'EOS M6 Mark II',
        slug: 'eos-m6-mark-ii',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/mirrorless/eos-m6-mark-ii?subtab=downloads-firmware'
      },
      {
        name: 'EOS M10',
        slug: 'eos-m10-ef-15-45mm-white-lens-kit',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/mirrorless/eos-m10-ef-15-45mm-white-lens-kit?subtab=downloads-firmware'
      },
      {
        name: 'EOS M50',
        slug: 'eos-m50-body',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/mirrorless/eos-m50-body?subtab=downloads-firmware'
      },
      {
        name: 'EOS M100',
        slug: 'eos-m100-ef-m-15-45mm-is-stm-kit',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/mirrorless/eos-m100-ef-m-15-45mm-is-stm-kit?subtab=downloads-firmware'
      },
      {
        name: 'EOS M200',
        slug: 'eos-m200-ef-m-15-45mm-is-stm-kit',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/mirrorless/eos-m200-ef-m-15-45mm-is-stm-kit?subtab=downloads-firmware'
      },
      {
        name: 'EOS Digital Rebel',
        slug: 'eos-digital-rebel',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/support-dslr/eos-digital-rebel/eos-digital-rebel?subtab=downloads-firmware'
      },
      {
        name: 'EOS R',
        slug: 'eos-r',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/mirrorless/eos-r?subtab=downloads-firmware'
      },
      {
        name: 'EOS Ra',
        slug: 'eos-ra',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/mirrorless/eos-ra?subtab=downloads-firmware'
      },
      {
        name: 'EOS RP',
        slug: 'eos-rp',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/mirrorless/eos-rp?subtab=downloads-firmware'
      },
      {
        name: 'EOS Rebel SL1',
        slug: 'eos-rebel-sl1-ef-s-18-55-is-stm-kit',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/dslr/eos-rebel-sl1-ef-s-18-55-is-stm-kit?subtab=downloads-firmware'
      },
      {
        name: 'EOS Rebel SL2',
        slug: 'eos-rebel-sl2-ef-s-18-55mm-is-stm-kit',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/dslr/eos-rebel-sl2-ef-s-18-55mm-is-stm-kit?subtab=downloads-firmware'
      },
      {
        name: 'EOS Rebel SL3',
        slug: 'eos-rebel-sl3-ef-s-18-55mm-is-stm-lens-kit',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/dslr/eos-rebel-sl3-ef-s-18-55mm-is-stm-lens-kit?subtab=downloads-firmware'
      },
      {
        name: 'EOS Rebel T1i',
        slug: 'eos-rebel-t1i',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/support-dslr/eos-rebel-t1i/eos-rebel-t1i?subtab=downloads-firmware'
      },
      {
        name: 'EOS Rebel T2i',
        slug: 'eos-rebel-t2i',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/support-dslr/eos-rebel-t2i/eos-rebel-t2i?subtab=downloads-firmware'
      },
      {
        name: 'EOS Rebel T3',
        slug: 'eos-rebel-t3',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/dslr/eos-rebel-t3/eos-rebel-t3?subtab=downloads-firmware'
      },
      {
        name: 'EOS Rebel T3i',
        slug: 'eos-rebel-t3i-body',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/support-dslr/eos-rebel-t3i-body/eos-rebel-t3i-body?subtab=downloads-firmware'
      },
      {
        name: 'EOS Rebel T4i',
        slug: 'eos-rebel-t4i',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/support-dslr/eos-rebel-t4i/eos-rebel-t4i?subtab=downloads-firmware'
      },
      {
        name: 'EOS Rebel T5',
        slug: 'eos-rebel-t5-ef-s-18-55-is-ii-kit',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/dslr/eos-rebel-t5-ef-s-18-55-is-ii-kit?subtab=downloads-firmware'
      },
      {
        name: 'EOS Rebel T5i',
        slug: 'eos-rebel-t5i-ef-s-18-55-is-stm-kit',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/dslr/eos-rebel-t5i-ef-s-18-55-is-stm-kit?subtab=downloads-firmware'
      },
      {
        name: 'EOS Rebel T6',
        slug: 'eos-rebel-t6-ef-s-18-55mm-is-ii-kit',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/dslr/eos-rebel-t6-ef-s-18-55mm-is-ii-kit?subtab=downloads-firmware'
      },
      {
        name: 'EOS Rebel T6i',
        slug: 'eos-rebel-t6i',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/dslr/eos-rebel-t6i/eos-rebel-t6i?subtab=downloads-firmware'
      },
      {
        name: 'EOS Rebel T6s',
        slug: 'eos-rebel-t6s-ef-s-18-135mm-is-stm-lens-kit',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/dslr/eos-rebel-t6s-ef-s-18-135mm-is-stm-lens-kit?subtab=downloads-firmware'
      },
      {
        name: 'EOS Rebel T7',
        slug: 'eos-rebel-t7-ef-s-18-55mm-is-ii-kit',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/dslr/eos-rebel-t7-ef-s-18-55mm-is-ii-kit?subtab=downloads-firmware'
      },
      {
        name: 'EOS Rebel T7i',
        slug: 'eos-rebel-t7i',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/eos-dslr-and-mirrorless-cameras/dslr/eos-rebel-t7i-body/eos-rebel-t7i?subtab=downloads-firmware'
      },
      {
        name: 'EOS Rebel X/XS',
        slug: 'eos-rebel-xxs',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/support-dslr/eos-rebel-x-xs/eos-rebel-xxs?subtab=downloads-firmware'
      },
      {
        name: 'EOS Rebel XS',
        slug: 'eos-rebel-xs',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/support-dslr/eos-rebel-xs/eos-rebel-xs?subtab=downloads-firmware'
      },
      {
        name: 'EOS Rebel XSi',
        slug: 'eos-rebel-xsi',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/support-dslr/eos-rebel-xsi/eos-rebel-xsi?subtab=downloads-firmware'
      },
      {
        name: 'EOS Digital Rebel XT',
        slug: 'eos-digital-rebel-xt',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/support-dslr/eos-digital-rebel-xt/eos-digital-rebel-xt?subtab=downloads-firmware'
      },
      {
        name: 'EOS Digital Rebel XTi',
        slug: 'eos-digital-rebel-xti',
        manufacturerSlug: 'canon',
        url: 'https://www.usa.canon.com/internet/portal/us/home/support/details/cameras/support-dslr/eos-digital-rebel-xti/eos-digital-rebel-xti?subtab=downloads-firmware'
      }
    ]

    const manufacturers = await queryInterface.sequelize.query(
      'SELECT idManufacturer, slug from Manufacturer;',
      {
        type: queryInterface.sequelize.QueryTypes.SELECT
      }
    )

    const devicesInsert = await devices.map((device) => {
      return {
        idDevice: uuid.v4(),
        name: device.name,
        slug: device.slug,
        idManufacturer: _.find(manufacturers, { slug: device.manufacturerSlug }).idManufacturer,
        url: device.url,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return queryInterface.bulkInsert('Device', devicesInsert, {})
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */

    return queryInterface.bulkDelete('Device', null, {})
  }
}
