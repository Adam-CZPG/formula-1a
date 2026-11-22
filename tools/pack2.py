"""2-asset to'plami (FORMULA_1a_assets.zip): katak fonini tozalaydi va assets/ ga WebP qilib yozadi.
Foydalanish: python3 tools/pack2.py /yo'l/FORMULA_1a_assets"""
import os,sys
from PIL import Image
sys.path.insert(0,os.path.dirname(__file__))
from clean_checker import clean
D=sys.argv[1];R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));A=os.path.join(R,'assets')
ICONS={'01_detail_engine':'pt_eng','02_detail_rear_wing':'pt_aero','03_detail_slick_tyre':'pt_tyre','04_detail_brake_disc':'pt_brake',
 '05_tyre_soft_S':'ty_S','06_tyre_medium_M':'ty_M','07_tyre_hard_H':'ty_H','08_tyre_wet_W':'ty_W',
 '09_mode_league_flag':'md_race','10_mode_duel_helmets':'md_duel','11_mode_time_trial':'md_tt','12_mode_championship_trophy':'md_champ',
 '13_shop_daily_gift':'sh_daily','14_shop_ad_reward':'sh_ad','15_shop_upgrade_card':'sh_card','16_shop_pitstop_wheel_gun':'sh_pit',
 '17_sponsor_TURBO':'sp_turbo','18_sponsor_APEX':'sp_apex','19_sponsor_GRIP':'sp_grip','20_sponsor_NITRO':'sp_nitro','21_sponsor_VELOCE':'sp_veloce','22_sponsor_1a_RACING':'sp_1a'}
CHECKER={'02_detail_rear_wing','04_detail_brake_disc','13_shop_daily_gift'}
for src,dst in ICONS.items():
    im=clean(os.path.join(D,src+'.png'),'checker' if src in CHECKER else 'edge')
    im.thumbnail((256,256) if dst.startswith('sp_') else (160,160),Image.LANCZOS);im.save(os.path.join(A,dst+'.webp'),'WEBP',quality=84,method=6)
for src,dst in {'23_track_grand_prix':'tr_0','24_track_city_night':'tr_1','25_track_high_speed':'tr_2'}.items():
    im=Image.open(os.path.join(D,src+'.png')).convert('RGB');w,h=im.size;im=im.crop((8,8,w-8,h-8))
    im.save(os.path.join(A,dst+'.webp'),'WEBP',quality=80,method=6)
print('ok',len(ICONS)+3)
