const ROOMS = ['gallery-subsidy','gallery-three','gallery-ceramics','gallery-market-economy','gallery-paintings'];
const make = (n, room, prompt, choices, correct, explanation, source) => ({id:`journey-v1-${n}`,roomId:ROOMS[room],prompt,options:choices.map((text,i)=>({id:`o${i+1}`,text})),correctOptionId:`o${correct+1}`,explanation,source});
// Editorial baseline from the museum's existing curated content, frozen per session.
const questions = [
 make(1,0,'Hành trình tìm đường cứu nước trong triển lãm bắt đầu vào năm nào?',['1905','1911','1919','1930'],1,'Mốc mở đầu là chuyến ra đi ngày 5/6/1911.','src/lib/db/gallery-subsidy.json: exhibit-nha-rong'),
 make(2,0,'Nguyễn Tất Thành ra nước ngoài với mục tiêu nào?',['Tìm con đường giải phóng dân tộc','Mở rộng thuộc địa','Tổ chức hội nghị năm 1911','Chấm dứt mọi giao lưu'],0,'Người tìm hiểu thế giới và tìm con đường mới cho dân tộc Việt Nam.','src/lib/db/gallery-subsidy.json'),
 make(3,1,'Nguyễn Tất Thành rời Tổ quốc từ địa điểm nào?',['Hương Cảng','Quảng Châu','Bến Nhà Rồng','Paris'],2,'Bến Nhà Rồng là điểm khởi hành ngày 5/6/1911.','src/lib/db/gallery-subsidy.json'),
 make(4,1,'Con tàu trong chuyến ra đi năm 1911 mang tên gì?',['Amiral Latouche-Tréville','Titanic','Aurora','Thống Nhất'],0,'Nguyễn Tất Thành rời Việt Nam trên tàu Amiral Latouche-Tréville.','src/lib/db/gallery-subsidy.json'),
 make(5,2,'Yêu sách của nhân dân An Nam được gửi đến hội nghị nào?',['Hội nghị Genève','Hội nghị Versailles','Hội nghị Bandung','Hội nghị hợp nhất'],1,'Bản Yêu sách được gửi tới Hội nghị Versailles năm 1919.','src/lib/db/gallery-subsidy.json: exhibit-versailles-1919'),
 make(6,2,'Bản Yêu sách năm 1919 gồm bao nhiêu điểm?',['3','5','8','10'],2,'Bản Yêu sách gồm 8 điểm, đòi các quyền tự do, dân chủ và bình đẳng cơ bản.','src/lib/db/gallery-subsidy.json: exhibit-versailles-1919'),
 make(7,3,'Nguyễn Ái Quốc sử dụng bí danh nào khi đến Quảng Châu năm 1924?',['Văn Ba','Lý Thụy','Trần Phú','Phan Bội Châu'],1,'Ngày 11/11/1924, Nguyễn Ái Quốc đến Quảng Châu với bí danh Lý Thụy.','src/lib/roomFourJourney.ts'),
 make(8,3,'Tờ báo nào ra số đầu tiên tại Quảng Châu ngày 21/6/1925?',['Nhân Dân','Lao Động','Thanh Niên','Tiền Phong'],2,'Số đầu tiên của báo Thanh Niên ra đời ngày 21/6/1925.','src/lib/roomFourJourney.ts'),
 make(9,4,'Phòng cuối hành trình giới thiệu sự kiện nào?',['Hội nghị hợp nhất các tổ chức cộng sản','Chuyến ra đi năm 1911','Hội nghị Versailles','Hội nghị Genève'],0,'Phòng Hội tụ tại Hương Cảng giới thiệu Hội nghị hợp nhất năm 1930.','docs/superpowers/plans/2026-09-15-multiplayer-competition-plan.md: section 3'),
 make(10,4,'Mốc năm gắn với Hội nghị hợp nhất tại Hương Cảng là năm nào?',['1911','1919','1925','1930'],3,'Mốc kết thúc hành trình triển lãm là Hội nghị hợp nhất năm 1930.','docs/superpowers/plans/2026-09-15-multiplayer-competition-plan.md: section 3'),
];
module.exports = { ROOMS, questions, version:'journey-1911-1930-v1' };
