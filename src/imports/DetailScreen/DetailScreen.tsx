import svgPaths from "./svg-lkcd0hqhyr";
import imgImageRichmore from "./dc1d3fe4ad70cd9cf075fd6306568a876f2d54b9.png";

function Icon() {
  return (
    <div className="relative shrink-0 size-[19.99px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.9899 19.9899">
        <g id="Icon">
          <path d={svgPaths.p1d301f80} id="Vector" stroke="var(--stroke-0, #0F0F0F)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="relative shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center relative size-full">
        <Icon />
        <p className="[word-break:break-word] font-['Nunito:Light',sans-serif] font-light leading-[20px] relative shrink-0 text-[#0f0f0f] text-[14px] text-center whitespace-nowrap">return</p>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[12.98px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.9804 12.9804">
        <g clipPath="url(#clip0_29_597)" id="Icon">
          <path d={svgPaths.p34cb630} id="Vector" stroke="var(--stroke-0, #0F0F0F)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p1d9bcd80} id="Vector_2" stroke="var(--stroke-0, #0F0F0F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.0817" />
        </g>
        <defs>
          <clipPath id="clip0_29_597">
            <rect fill="white" height="12.9804" width="12.9804" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="relative rounded-[42885100px] shrink-0" data-name="Button">
      <div aria-hidden className="absolute border-[0.2px] border-black border-solid inset-0 pointer-events-none rounded-[42885100px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[6px] items-center px-[12.2px] py-[6.2px] relative size-full">
        <Icon1 />
        <p className="[word-break:break-word] font-['Nunito:Light',sans-serif] font-light leading-[16px] relative shrink-0 text-[#0f0f0f] text-[12px] text-center whitespace-nowrap">edit</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between px-[16px] py-[12px] relative size-full">
          <Button />
          <Button1 />
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="bg-[rgba(255,255,255,0.9)] relative shrink-0 w-full" data-name="Header">
      <div aria-hidden className="absolute border-[rgba(0,0,0,0.08)] border-b-[1.278px] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[1.278px] relative size-full">
        <Container />
      </div>
    </div>
  );
}

function ImageRichmore() {
  return (
    <div className="h-[265.52px] relative shrink-0 w-full" data-name="Image (Richmore チャコール)">
      <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImageRichmore} />
    </div>
  );
}

function Container2() {
  return <div className="absolute bg-gradient-to-t from-[rgba(0,0,0,0.3)] h-[95.995px] left-0 to-[rgba(0,0,0,0)] top-[169.52px] w-[354.027px]" data-name="Container" />;
}

function Container1() {
  return (
    <div className="bg-[#f2f2f2] h-[265.52px] relative shrink-0 w-[354.027px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <ImageRichmore />
        <Container2 />
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="relative shrink-0 w-full" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <p className="[word-break:break-word] font-['Nunito:Light',sans-serif] font-light leading-[16.5px] relative shrink-0 text-[#888] text-[11px] tracking-[1.1px] uppercase whitespace-nowrap">Richmore</p>
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="bg-[#4a4a4a] relative rounded-[42885100px] shrink-0 size-[19.99px]" data-name="Text">
      <div aria-hidden className="absolute border-[1.278px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[42885100px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function Heading() {
  return (
    <div className="h-[29.995px] relative shrink-0 w-[119.72px]" data-name="Heading 1">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Nunito:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[30px] left-0 text-[#0f0f0f] text-[20px] top-[-1.56px] whitespace-nowrap">チャコール</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[37.995px] relative shrink-0 w-[314.047px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[10px] items-center relative size-full">
        <Text />
        <Heading />
      </div>
    </div>
  );
}

function Tag() {
  return (
    <div className="absolute bg-[#f2f2f2] content-stretch flex items-center left-0 px-[10px] py-[4px] rounded-[42885100px] top-[2px]" data-name="Tag">
      <p className="[word-break:break-word] font-['Nunito:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[16.5px] relative shrink-0 text-[#888] text-[10px] tracking-[0.275px] whitespace-nowrap">メリノウール</p>
    </div>
  );
}

function Tag1() {
  return (
    <div className="absolute bg-[#f2f2f2] content-stretch flex items-center left-[93.58px] px-[10px] py-[4px] rounded-[42885100px] top-[2px]" data-name="Tag">
      <p className="[word-break:break-word] font-['Nunito:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[16.5px] relative shrink-0 text-[#888] text-[10px] tracking-[0.275px] whitespace-nowrap">極太</p>
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[26.48px] relative shrink-0 w-full" data-name="Container">
      <Tag />
      <Tag1 />
    </div>
  );
}

function ContainerMargin() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Container6 />
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="relative shrink-0 w-[314.047px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[10px] items-start pt-[24px] relative size-full">
        <Paragraph />
        <Container5 />
        <ContainerMargin />
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="h-[1.278px] relative shrink-0 w-[314.047px]" data-name="Container">
      <div aria-hidden className="absolute border-[rgba(0,0,0,0.08)] border-solid border-t-[1.278px] inset-0 pointer-events-none" />
    </div>
  );
}

function ContainerMargin1() {
  return (
    <div className="relative shrink-0" data-name="Container (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[24px] relative size-full">
        <Container7 />
      </div>
    </div>
  );
}

function FieldLabel() {
  return (
    <div className="h-[16.495px] relative shrink-0 w-[116.485px]" data-name="FieldLabel">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Nunito:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[16.5px] left-0 text-[#888] text-[11px] top-[-1px] tracking-[1.1px] uppercase whitespace-nowrap">個数</p>
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="absolute h-[40px] left-0 top-0 w-[21.607px]" data-name="Text">
      <p className="[word-break:break-word] absolute font-['Nunito:Light',sans-serif] font-light leading-[40px] left-0 text-[#f5006a] text-[36px] top-[-1.11px] whitespace-nowrap">1</p>
    </div>
  );
}

function Text2() {
  return (
    <div className="absolute h-[19.99px] left-[27.6px] top-[16.61px] w-[13.999px]" data-name="Text">
      <p className="[word-break:break-word] absolute font-['Nunito:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[20px] left-0 text-[#f5006a] text-[14px] top-[-1px] whitespace-nowrap">個</p>
    </div>
  );
}

function Container10() {
  return (
    <div className="h-[40px] relative shrink-0 w-[116.485px]" data-name="Container">
      <Text1 />
      <Text2 />
    </div>
  );
}

function ContainerMargin3() {
  return (
    <div className="relative shrink-0" data-name="Container (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[8px] relative size-full">
        <Container10 />
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col items-start p-[16.5px] relative rounded-[30px] shrink-0" data-name="Container">
      <div aria-hidden className="absolute border-[#f5006a] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[30px]" />
      <FieldLabel />
      <ContainerMargin3 />
    </div>
  );
}

function FieldLabel1() {
  return (
    <div className="relative shrink-0" data-name="FieldLabel">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="[word-break:break-word] font-['Nunito:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[16.5px] relative shrink-0 text-[#888] text-[11px] tracking-[1.1px] uppercase whitespace-nowrap">購入日</p>
      </div>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[22.746px] relative shrink-0 w-[119.041px]" data-name="Paragraph">
      <p className="[word-break:break-word] absolute font-['Nunito:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[22.75px] left-0 text-[#0f0f0f] text-[14px] top-[-0.72px] whitespace-nowrap">2024年5月2日</p>
    </div>
  );
}

function ParagraphMargin() {
  return (
    <div className="h-[30.746px] relative shrink-0" data-name="Paragraph (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[8px] relative size-full">
        <Paragraph1 />
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="relative rounded-[16px] self-stretch shrink-0" data-name="Container">
      <div className="content-stretch flex flex-col items-start p-[16px] relative size-full">
        <FieldLabel1 />
        <ParagraphMargin />
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-[314.525px]" data-name="Container">
      <Container9 />
      <Container11 />
    </div>
  );
}

function ContainerMargin2() {
  return (
    <div className="relative shrink-0" data-name="Container (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[24px] relative size-full">
        <Container8 />
      </div>
    </div>
  );
}

function FieldLabel2() {
  return (
    <div className="relative shrink-0 w-full" data-name="FieldLabel">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <p className="[word-break:break-word] font-['Nunito:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[16.5px] relative shrink-0 text-[#888] text-[11px] tracking-[1.1px] uppercase whitespace-nowrap">スペック</p>
      </div>
    </div>
  );
}

function Text3() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[23.984px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Nunito:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[16px] left-0 text-[#888] text-[12px] top-0 whitespace-nowrap">重量</p>
      </div>
    </div>
  );
}

function Text4() {
  return (
    <div className="h-[19.99px] relative shrink-0 w-[13.999px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Nunito:SemiBold',sans-serif] font-semibold leading-[20px] left-0 text-[#0f0f0f] text-[14px] top-[-1px] whitespace-nowrap">—</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div aria-hidden className="absolute border-[rgba(0,0,0,0.08)] border-b-[0.5px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between pb-[12.5px] pt-[12px] px-[16px] relative size-full">
          <Text3 />
          <Text4 />
        </div>
      </div>
    </div>
  );
}

function Text5() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[23.984px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Nunito:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[16px] left-0 text-[#888] text-[12px] top-0 whitespace-nowrap">棒針</p>
      </div>
    </div>
  );
}

function Text6() {
  return (
    <div className="h-[19.99px] relative shrink-0 w-[13.999px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Nunito:SemiBold',sans-serif] font-semibold leading-[20px] left-0 text-[#0f0f0f] text-[14px] top-[-1px] whitespace-nowrap">—</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div aria-hidden className="absolute border-[rgba(0,0,0,0.08)] border-b-[0.5px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between pb-[12.5px] pt-[12px] px-[16px] relative size-full">
          <Text5 />
          <Text6 />
        </div>
      </div>
    </div>
  );
}

function Text7() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[35.966px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Nunito:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[16px] left-0 text-[#888] text-[12px] top-0 whitespace-nowrap">かぎ針</p>
      </div>
    </div>
  );
}

function Text8() {
  return (
    <div className="h-[19.99px] relative shrink-0 w-[13.999px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Nunito:SemiBold',sans-serif] font-semibold leading-[20px] left-0 text-[#0f0f0f] text-[14px] top-[-1px] whitespace-nowrap">—</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div aria-hidden className="absolute border-[rgba(0,0,0,0.08)] border-b-[0.5px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between pb-[12.5px] pt-[12px] px-[16px] relative size-full">
          <Text7 />
          <Text8 />
        </div>
      </div>
    </div>
  );
}

function Text9() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[131.642px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Nunito:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[16px] left-0 text-[#888] text-[12px] top-0 whitespace-nowrap">メリヤス編み標準ゲージ</p>
      </div>
    </div>
  );
}

function Text10() {
  return (
    <div className="h-[19.99px] relative shrink-0 w-[13.999px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Nunito:SemiBold',sans-serif] font-semibold leading-[20px] left-0 text-[#0f0f0f] text-[14px] top-[-1px] whitespace-nowrap">—</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between px-[16px] py-[12px] relative size-full">
          <Text9 />
          <Text10 />
        </div>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col h-[179.649px] items-start overflow-clip relative rounded-[20px] shrink-0 w-full" data-name="Container">
      <Container14 />
      <Container15 />
      <Container16 />
      <Container17 />
    </div>
  );
}

function ContainerMargin4() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[8px] relative size-full">
        <Container13 />
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="h-[228.649px] relative shrink-0 w-[314.047px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[24px] relative size-full">
        <FieldLabel2 />
        <ContainerMargin4 />
      </div>
    </div>
  );
}

function FieldLabel3() {
  return (
    <div className="relative shrink-0 w-full" data-name="FieldLabel">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <p className="[word-break:break-word] font-['Nunito:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[16.5px] relative shrink-0 text-[#888] text-[11px] tracking-[1.1px] uppercase whitespace-nowrap">備考</p>
      </div>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[22.746px] relative shrink-0 w-[282.055px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Nunito:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[22.75px] left-0 text-[#0f0f0f] text-[14px] top-[-0.72px] whitespace-nowrap">残り1個。早めに補充が必要。</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="relative rounded-[20px] shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[16px] py-[14px] relative size-full">
        <Paragraph2 />
      </div>
    </div>
  );
}

function ContainerMargin5() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[8px] relative size-full">
        <Container19 />
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="h-[99.746px] relative shrink-0 w-[314.047px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[24px] relative size-full">
        <FieldLabel3 />
        <ContainerMargin5 />
      </div>
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[14.997px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.9974 14.9974">
        <g clipPath="url(#clip0_29_590)" id="Icon">
          <path d="M1.87468 3.74935H13.1227" id="Vector" stroke="var(--stroke-0, #D0182A)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p5fd8b00} id="Vector_2" stroke="var(--stroke-0, #D0182A)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p21f56180} id="Vector_3" stroke="var(--stroke-0, #D0182A)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.24892 6.87381V10.6232" id="Vector_4" stroke="var(--stroke-0, #D0182A)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8.74848 6.87381V10.6232" id="Vector_5" stroke="var(--stroke-0, #D0182A)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <defs>
          <clipPath id="clip0_29_590">
            <rect fill="white" height="14.9974" width="14.9974" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="relative rounded-[20px] shrink-0 w-[314.047px]" data-name="Button">
      <div aria-hidden className="absolute border-[#d0182a] border-[0.2px] border-solid inset-0 pointer-events-none rounded-[20px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center justify-center px-[0.2px] py-[12.2px] relative size-full">
        <Icon2 />
        <p className="[word-break:break-word] font-['Nunito:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[20px] relative shrink-0 text-[#d0182a] text-[14px] text-center whitespace-nowrap">この毛糸を削除する</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[17.278px] relative shrink-0" data-name="Container">
      <div aria-hidden className="absolute border-[rgba(0,0,0,0.08)] border-solid border-t-[1.278px] inset-0 pointer-events-none" />
      <Button2 />
    </div>
  );
}

function ContainerMargin6() {
  return (
    <div className="relative shrink-0" data-name="Container (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[24px] relative size-full">
        <Container20 />
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[811.218px] items-start left-0 pb-[48px] pt-[24px] px-[20px] rounded-tl-[30px] rounded-tr-[30px] top-[-20px] w-[354.027px]" data-name="Container">
      <Container4 />
      <ContainerMargin1 />
      <ContainerMargin2 />
      <Container12 />
      <Container18 />
      <ContainerMargin6 />
    </div>
  );
}

function ContainerNegativeMargin() {
  return (
    <div className="flex-[791.218_0_0] min-h-px relative w-full" data-name="Container (negative margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Container3 />
      </div>
    </div>
  );
}

export default function DetailScreen() {
  return (
    <div className="content-stretch flex flex-col items-start relative size-full" data-name="DetailScreen">
      <Header />
      <Container1 />
      <ContainerNegativeMargin />
    </div>
  );
}