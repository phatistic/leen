namespace SpriteKind {
    export const Playerhitbox = SpriteKind.create()
    export const Item = SpriteKind.create()
}
namespace NumProp {
    export const Selector = NumProp.create()
    export const MaxSelector = NumProp.create()
}
namespace NumArrayProp {
    export const ResultVal = NumArrayProp.create()
}
namespace AnyProp {
    export const ResultObj = AnyProp.create()
}
function AddItemGridData () {
    ItemGridList = []
    for (let I = 0; I <= MapRow - 1; I++) {
        for (let J = 0; J <= MapCol - 1; J++) {
            Arow = OffRow + I
            Acol = OffCol + J
            gidx = GetTiledAt(Acol, Arow)
            if (TileMapGridList[gidx] < 0) {
                ItemGridList.push(-1)
            } else {
                ItemGridList.push(0)
            }
            Item_sprite = Get_item_on_tile(Acol, Arow)
            if (Item_sprite) {
                ItemGridList[gidx] = 1 + sprites.readDataNumber(Item_sprite, "ID")
            }
        }
    }
}
function UpdatePlayerGridData () {
    for (let I = 0; I <= MapRow - 1; I++) {
        for (let J = 0; J <= MapCol - 1; J++) {
            Arow = OffRow + I
            Acol = OffCol + J
            gidx = GetTiledAt(Acol, Arow)
            if (TileMapGridList[gidx] < 0) {
                PlayerGridList[gidx] = -1
            } else {
                PlayerGridList[gidx] = 0
            }
            Playersprite = Get_player_on_tile(Acol, Arow)
            if (Playersprite) {
                PlayerGridList[gidx] = 1 + sprites.readDataNumber(Playersprite, "P#")
            }
        }
    }
}
function ProcessPlayerGrid () {
    UpdatePlayerGridData()
    if (ListTable[1] == ItemGridList) {
        return ListTable[1]
    }
    ListTable[1] = ItemGridList
    return ListTable[1]
}
function Create_player (Paper: Image, Player: number, Dir: number, AI2: boolean) {
    Playersprite = sprites.create(Paper, SpriteKind.Player)
    sprites.setDataBoolean(Playersprite, "AI", AI2)
    sprites.setDataBoolean(Playersprite, "St", false)
    sprites.setDataNumber(Playersprite, "Player", Player)
    sprites.setDataNumber(Playersprite, "P#", Player)
    sprites.setDataNumber(Playersprite, "Dir", Dir)
    sprites.setDataNumber(Playersprite, "Di", Dir * HalfDir)
    sprites.setDataNumber(Playersprite, "Deg", 0)
    sprites.setDataNumber(Playersprite, "E", 0)
    sprites.setDataNumber(Playersprite, "H", 5)
    sprites.setDataNumber(Playersprite, "A", 1)
    Player_rotation.push(scaling.createRotations(Playersprite.image, dir_frame))
    Playersprite.setImage(Player_rotation[Player][Math.abs(Dir) * HalfDir].clone())
    if (Dir < 0) {
        Playersprite.image.flipY()
    }
    return Playersprite
}
function ResetGame (RestartGame: boolean) {
    Start = false
    sprites.destroyAllSpritesOfKind(SpriteKind.Player)
    sprites.destroyAllSpritesOfKind(SpriteKind.Item)
    tiles.loadMap(tiles.createSmallMap(tilemap`level18`))
    BeginSetup()
    InGame = true
    Render = false
    if (CurrentMaxPlayer) {
        Max_player = CurrentMaxPlayer
    }
    if (RestartGame) {
        select_maximum = true
        SelectPlayersToStart()
    }
    if (!(OpenMenu)) {
        StartGame()
    }
}
spriteutils.createRenderable(10, function (screen2) {
    if (!(Start)) {
        screen2.fillRect(0, 0, scene.screenWidth(), scene.screenHeight(), 11)
        if (!(select_maximum)) {
            screen2.fillRect(0, 0, scene.screenWidth(), scene.screenHeight(), 15)
            images.printCenter(screen2, "Loading...", 56, 1)
        }
    }
})
function Check_overlap_in_setup (Chance: number) {
    PlacingItem = Item_sprite
    tiles.placeOnRandomTile(PlacingItem, assets.tile`myTile0`)
    if (LocationPlaced.indexOf(PlacingItem.tilemapLocation()) >= 0) {
        while (LocationPlaced.indexOf(PlacingItem.tilemapLocation()) >= 0) {
            tiles.placeOnRandomTile(PlacingItem, assets.tile`myTile0`)
        }
    }
    LocationPlaced.push(PlacingItem.tilemapLocation())
}
function MyPlayerInTrunIs () {
    if (!(My_player)) {
        NextTrun()
    }
}
function CheckSumOfDirection (Di: number) {
    if (Math.abs(Di) >= Udir) {
        return 0 - Di
    }
    return Di
}
function Ready (Player: Sprite) {
    if (Player.vx == 0 && Player.vy == 0) {
        return true
    }
    return false
}
function Get_Player_upgraded () {
    if (sprites.readDataString(Item_sprite, "Name") == "H") {
        sprites.changeDataNumberBy(My_player, "H", sprites.readDataNumber(Item_sprite, "Val"))
    } else if (sprites.readDataString(Item_sprite, "Name") == "E") {
        sprites.changeDataNumberBy(My_player, "E", sprites.readDataNumber(Item_sprite, "Val"))
    } else if (sprites.readDataString(Item_sprite, "Name") == "A") {
        sprites.changeDataNumberBy(My_player, "A", sprites.readDataNumber(Item_sprite, "Val"))
    }
    sprites.destroy(Item_sprite, effects.disintegrate, 500)
}
function NextTrun () {
    Trun = (Trun + 1) % sprites.allOfKind(SpriteKind.Player).length
    My_player = New_trun(Trun)
    My_player.sayText(convertToText(sprites.readDataNumber(My_player, "E")), 500, false)
}
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (!(InGame)) {
        ResetGame(false)
    }
})
function DirControl (Player: Sprite, Trun: number) {
    index = TowardList.indexOf(sprites.readDataNumber(Player, "Dir")) % DirToward
    for (let value of TowardList) {
        if (TowardList[index] == Trun) {
            sprites.setDataNumber(Player, "Deg", 0)
        } else if (TowardList[index] < Trun) {
            sprites.setDataNumber(Player, "Deg", 1)
        } else if (TowardList[index] > Trun) {
            sprites.setDataNumber(Player, "Deg", -1)
        } else {
            sprites.setDataNumber(Player, "Deg", randint(-1, 1))
            while (sprites.readDataNumber(Player, "Deg") != 0) {
                sprites.setDataNumber(Player, "Deg", randint(-1, 1))
            }
        }
        index = (index + 1) % DirToward
    }
}
function SetCostume () {
    for (let value of sprites.allOfKind(SpriteKind.Player)) {
        value.setImage(SetDirCostume(value))
    }
}
function TextStateUpdate () {
    if (Start) {
        Str = ""
        for (let value of sprites.allOfKind(SpriteKind.Player)) {
            Colour = ColorList[sprites.readDataNumber(value, "P#")]
            if (Trun == sprites.readDataNumber(value, "Player")) {
                Str = "" + Str + ("Player" + convertToText(sprites.readDataNumber(value, "P#") + 1) + " !")
            } else {
                Str = "" + Str + ("Player" + convertToText(sprites.readDataNumber(value, "P#") + 1))
            }
            Str = "" + Str + " \\n " + ("H:" + convertToText(sprites.readDataNumber(value, "H")) + " D:" + convertToText(sprites.readDataNumber(value, "A")) + " E:" + convertToText(sprites.readDataNumber(value, "E")))
            Str = "" + Str + " \\n "
        }
        fancyText.setText(TextNameSprite, Str)
    }
}
function TickDir () {
    for (let value of sprites.allOfKind(SpriteKind.Player)) {
        if (sprites.readDataNumber(value, "Di") == sprites.readDataNumber(value, "Dir") * HalfDir) {
            sprites.setDataNumber(value, "Deg", 0)
        } else {
            TrunToward(value)
        }
    }
}
function Setup_asset () {
    Map_asset = [
    assets.tile`myTile31`,
    assets.tile`myTile32`,
    assets.tile`myTile33`,
    assets.tile`myTile34`,
    assets.tile`myTile35`,
    assets.tile`myTile36`,
    assets.tile`myTile37`,
    assets.tile`myTile38`,
    assets.tile`myTile39`,
    assets.tile`myTile40`,
    assets.tile`myTile41`,
    assets.tile`myTile42`,
    assets.tile`myTile43`,
    assets.tile`myTile44`,
    assets.tile`myTile45`,
    assets.tile`myTile46`
    ]
    MapRecipe = [
    "0000",
    "0110",
    "0111",
    "0011",
    "0010",
    "1110",
    "1111",
    "1011",
    "1010",
    "1100",
    "1101",
    "1001",
    "1000",
    "0100",
    "0101",
    "0001"
    ]
    MapGroup = []
    for (let index2 = 0; index2 < Map_asset.length; index2++) {
        MapGroup.push(1)
    }
}
function FixTileAt (Idx: number) {
    Tile = TileMapGridList[Idx]
    if (Tile < 0) {
        return
    }
    TileGP = MapGroup[Tile]
    if (TileGP <= 0) {
        return
    }
    Recipe = ""
    Build_Recipe(Idx - MapCol)
    Build_Recipe(Idx + 1)
    Build_Recipe(Idx + MapCol)
    Build_Recipe(Idx - 1)
    for (let index = 0; index <= MapGroup.length - 1; index++) {
        if (MapGroup[index] == TileGP) {
            if (MapRecipe[index] == Recipe) {
                TileMapGridList[Idx] = index
                return
            }
        }
    }
}
function TextUpdate () {
    TextNameSprite.setPosition(72 / 2, 8 / 2)
    fancyText.setColor(TextNameSprite, 1)
}
function UpdateItemGridData () {
    for (let I = 0; I <= MapRow - 1; I++) {
        for (let J = 0; J <= MapCol - 1; J++) {
            Arow = OffRow + I
            Acol = OffCol + J
            gidx = GetTiledAt(Acol, Arow)
            if (TileMapGridList[gidx] < 0) {
                ItemGridList[gidx] = -1
            } else {
                ItemGridList[gidx] = 0
            }
            Item_sprite = Get_item_on_tile(Acol, Arow)
            if (Item_sprite) {
                ItemGridList[gidx] = 1 + sprites.readDataNumber(Item_sprite, "ID")
            }
        }
    }
}
function MyPlayerTick () {
    if (My_player) {
        My_player.setImage(SetDirCostume(My_player))
        if (Ready(My_player)) {
            tiles.placeOnTile(My_player, My_player.tilemapLocation())
            if (!(sprites.readDataBoolean(My_player, "St")) && Get_stucked(My_player)) {
                sprites.setDataNumber(My_player, "E", 0)
                sprites.setDataBoolean(My_player, "St", true)
            }
            if (sprites.readDataNumber(My_player, "E") >= 0 || sprites.readDataBoolean(My_player, "Played")) {
                if (!(Action)) {
                    My_player = spriteutils.nullConsts(spriteutils.NullConsts.Undefined)
                }
            }
            if (sprites.readDataNumber(My_player, "E") <= 0) {
                Item_sprite = Get_item_on_tile(My_player.tilemapLocation().column, My_player.tilemapLocation().row)
                if (Item_sprite) {
                    Get_Player_upgraded()
                    PlaySoundEffect(1)
                }
                if (My_player) {
                    Playersprite = Get_touching_on(My_player)
                    GetPlayed = false
                    if (!(Playersprite)) {
                        GetPlayed = true
                    }
                } else {
                    GetPlayed = false
                }
                if (GetPlayed) {
                    sprites.setDataBoolean(My_player, "HasPlay", true)
                    sprites.setDataBoolean(My_player, "Played", true)
                }
            }
        } else {
            sprites.setDataBoolean(My_player, "St", false)
        }
    }
}
function Get_player_on_trun (Trun: number) {
    for (let value of sprites.allOfKind(SpriteKind.Player)) {
        if (Trun == sprites.readDataNumber(value, "Player")) {
            return value
        }
    }
    return spriteutils.nullConsts(spriteutils.NullConsts.Undefined)
}
function CreateMenuSprite (MenuData: any[], Header: string, Option: number[], Frame: Image, Depth: number, ResultList: any[]) {
    MenuSprite = miniMenu.createMenuFromArray(MenuData)
    if (Header != spriteutils.nullConsts(spriteutils.NullConsts.Undefined)) {
        MenuSprite.setTitle(Header)
    }
    if (Frame != spriteutils.nullConsts(spriteutils.NullConsts.Undefined)) {
        MenuSprite.setFrame(Frame)
    }
    MenuSprite.setDimensions(Option[2], Option[3])
    MenuSprite.setPosition(Option[0], Option[1])
    MenuSprite.z = Depth
    blockObject.storeOnSprite(blockObject.create(), MenuSprite)
    blockObject.setNumberArrayProperty(MenuSprite, NumArrayProp.ResultVal, ResultList)
    return MenuSprite
}
function Get_touching_on (Player: Sprite) {
    Player_location = Player.tilemapLocation()
    if (sprites.readDataNumber(Player, "Dir") == 1) {
        return Get_player_on_tile(Player_location.column + 1, Player_location.row)
    } else if (sprites.readDataNumber(Player, "Dir") == 2) {
        return Get_player_on_tile(Player_location.column, Player_location.row + 1)
    } else if (sprites.readDataNumber(Player, "Dir") == 3) {
        return Get_player_on_tile(Player_location.column - 1, Player_location.row)
    } else {
        return Get_player_on_tile(Player_location.column, Player_location.row - 1)
    }
    return spriteutils.nullConsts(spriteutils.NullConsts.Undefined)
}
function LeaderBoardCapture (Player: Sprite, InsertBegin: boolean, PlayerId: number) {
    if (LeaderBoardList.indexOf(sprites.readDataNumber(Player, "P#")) >= 0) {
        return
    }
    if (InsertBegin) {
        LeaderBoardList.unshift(sprites.readDataNumber(Player, "P#"))
        return
    }
    LeaderBoardList.push(sprites.readDataNumber(Player, "P#"))
}
function UpdateListData () {
    ItemGridList = ProcessItemGrid()
    PlayerGridList = ProcessPlayerGrid()
}
function AddPlayerGridData () {
    PlayerData = []
    PlayerGridList = []
    for (let I = 0; I <= MapRow - 1; I++) {
        for (let J = 0; J <= MapCol - 1; J++) {
            Arow = OffRow + I
            Acol = OffCol + J
            gidx = GetTiledAt(Acol, Arow)
            if (TileMapGridList[gidx] < 0) {
                PlayerGridList.push(-1)
            } else {
                PlayerGridList.push(0)
            }
            Playersprite = Get_player_on_tile(Acol, Arow)
            if (Playersprite) {
                PlayerGridList[gidx] = 1 + sprites.readDataNumber(Playersprite, "P#")
            }
        }
    }
}
function GetMovement (Dir: number, UTrun: number) {
    if (Ready(My_player)) {
        DirControl(My_player, Dir)
        if (sprites.readDataNumber(My_player, "Dir") != UTrun) {
            sprites.setDataNumber(My_player, "Dir", Dir)
            if (Can_i_move_here(My_player)) {
                Walk_in_direction(sprites.readDataNumber(My_player, "Dir"), true)
                My_player.sayText(convertToText(sprites.readDataNumber(My_player, "E")), 500, false)
                PlaySoundEffect(0)
            }
        } else {
            if (Can_i_Utrun_here(My_player)) {
                sprites.setDataNumber(My_player, "Dir", Dir)
                Walk_in_direction(sprites.readDataNumber(My_player, "Dir"), false)
                PlaySoundEffect(4)
            }
        }
    }
}
function PlacePlayerInSetup (Chance: number) {
    PlacingPlayer = Playersprite
    tiles.placeOnRandomTile(PlacingPlayer, assets.tile`myTile0`)
    if (LocationPlaced.indexOf(PlacingPlayer.tilemapLocation()) >= 0) {
        while (LocationPlaced.indexOf(PlacingPlayer.tilemapLocation()) >= 0) {
            tiles.placeOnRandomTile(PlacingPlayer, assets.tile`myTile0`)
        }
    }
    LocationPlaced.push(PlacingPlayer.tilemapLocation())
}
sprites.onDestroyed(SpriteKind.Player, function (sprite) {
    if (InGame) {
        if (Start) {
            let PlayerKilledList: number[] = []
            if (sprites.allOfKind(SpriteKind.Player).length <= 1) {
                Trun = sprites.allOfKind(SpriteKind.Player).length - 1
                My_player = Get_player_on_trun(Trun)
                LeaderBoardCapture(My_player, true, 1)
            }
            timer.after(50, function () {
                LeaderBoardCapture(sprite, PlayerKilledList.indexOf(sprites.readDataNumber(sprite, "P#")) >= 0, 1)
            })
            if (My_player) {
                if (sprites.readDataBoolean(My_player, "HasPlay") != sprites.readDataBoolean(My_player, "Perfect")) {
                    if (LeaderBoardColorList.indexOf(8) < 0) {
                        LeaderBoardColorList.unshift(8)
                    }
                }
                PlayerKilledList.push(sprites.readDataNumber(My_player, "P#"))
                GetPlayed = true
            }
            if (sprites.allOfKind(SpriteKind.Player).length == 1) {
                timer.after(1000, function () {
                    color.startFadeFromCurrent(color.White, 500)
                    timer.after(500, function () {
                        WinIntro = true
                        InGame = false
                        timer.after(500, function () {
                            color.startFadeFromCurrent(color.originalPalette, 500)
                            timer.after(500, function () {
                                color.clearFadeEffect()
                            })
                        })
                    })
                })
            }
        }
    }
})
function New_trun (Trun: number) {
    Playersprite = Get_player_on_trun(Trun)
    sprites.changeDataNumberBy(Playersprite, "E", randint(1, 6))
    sprites.setDataBoolean(Playersprite, "Played", false)
    Max_energy = sprites.readDataNumber(Playersprite, "E")
    return Playersprite
}
function Build_Recipe (EdgeIdx: number) {
    EdgeTile = TileMapGridList[EdgeIdx]
    if (TileGP == MapGroup[EdgeTile]) {
        Recipe = "" + Recipe + "1"
    } else {
        Recipe = "" + Recipe + "0"
    }
}
function Get_item_on_tile (Col: number, Row: number) {
    for (let value of sprites.allOfKind(SpriteKind.Item)) {
        if (Col == value.tilemapLocation().column && Row == value.tilemapLocation().row) {
            return value
        }
    }
    return spriteutils.nullConsts(spriteutils.NullConsts.Undefined)
}
function Get_player_acttacked (Dir: number, Touching: boolean, Damage: number, Player: Sprite) {
    if (Touching) {
        if (Dir == TowardList[0]) {
            Player.fx = 30
            Player.vx = Math.sqrt(2 * (Playersprite.fx * 8))
        } else if (Dir == TowardList[1]) {
            Player.fy = 30
            Player.vy = Math.sqrt(2 * (Playersprite.fy * 8))
        } else if (Dir == TowardList[2]) {
            Player.fx = 30
            Player.vx = 0 - Math.sqrt(2 * (Playersprite.fx * 8))
        } else if (Dir == TowardList[3]) {
            Player.fy = 30
            Player.vy = 0 - Math.sqrt(2 * (Playersprite.fy * 8))
        }
        sprites.changeDataNumberBy(Player, "H", 0 - Damage)
    }
}
function SetDirCostume (Player: Sprite) {
    if (sprites.readDataNumber(Player, "Dir") * HalfDir == sprites.readDataNumber(Player, "Di")) {
        Player.setImage(Player_rotation[sprites.readDataNumber(Player, "P#")][Math.abs(sprites.readDataNumber(Player, "Dir")) * HalfDir].clone())
        if (sprites.readDataNumber(Player, "Dir") < 0) {
            Player.image.flipY()
        }
    } else {
        Player.setImage(Player_rotation[sprites.readDataNumber(Player, "P#")][Math.abs(sprites.readDataNumber(Player, "Di"))].clone())
        if (sprites.readDataNumber(Player, "Di") < 0) {
            Player.image.flipY()
        }
    }
    return Player.image
}
function TimeToFixTile (Idx: number) {
    FixTileAt(Idx)
    FixTileAt(Idx + 1)
    FixTileAt(Idx + MapCol)
    FixTileAt(Idx - 1)
    FixTileAt(Idx - MapCol)
}
function Walk_in_direction (Dir: number, Walk: boolean) {
    if (!(Walk)) {
        sprites.setDataNumber(My_player, "E", 0)
    } else {
        if (Dir == TowardList[0]) {
            My_player.fx = 30
            My_player.vx = Math.sqrt(2 * (My_player.fx * 8))
        } else if (Dir == TowardList[1]) {
            My_player.fy = 30
            My_player.vy = Math.sqrt(2 * (My_player.fy * 8))
        } else if (Dir == TowardList[2]) {
            My_player.fx = 30
            My_player.vx = 0 - Math.sqrt(2 * (My_player.fx * 8))
        } else if (Dir == TowardList[3]) {
            My_player.fy = 30
            My_player.vy = 0 - Math.sqrt(2 * (My_player.fy * 8))
        }
        sprites.changeDataNumberBy(My_player, "E", -1)
    }
}
function ProcessItemGrid () {
    UpdateItemGridData()
    if (ListTable[0] == ItemGridList) {
        return ListTable[0]
    }
    ListTable[0] = ItemGridList
    return ListTable[0]
}
function RenderTile () {
    for (let index = 0; index <= MapCol * MapRow - 1; index++) {
        if (TileMapGridList[index] < 0) {
            tiles.setTileAt(tiles.getTileLocation(OffCol + index % 1, OffRow + Math.floor(index / MapCol)), TileHole[Math.abs(TileMapGridList[index]) - 1])
        } else {
            TimeToFixTile(index)
            tiles.setTileAt(tiles.getTileLocation(OffCol + index % MapCol, OffRow + Math.floor(index / MapCol)), Map_asset[TileMapGridList[index]])
        }
    }
}
function PlaySoundEffect (SoundID: number) {
    SoundList = [
    music.createSoundEffect(
    WaveShape.Square,
    869,
    2801,
    255,
    0,
    162,
    SoundExpressionEffect.None,
    InterpolationCurve.Logarithmic
    ),
    music.createSoundEffect(
    WaveShape.Sawtooth,
    305,
    186,
    255,
    0,
    450,
    SoundExpressionEffect.None,
    InterpolationCurve.Curve
    ),
    music.createSoundEffect(
    WaveShape.Noise,
    2385,
    602,
    255,
    0,
    550,
    SoundExpressionEffect.None,
    InterpolationCurve.Curve
    ),
    music.createSoundEffect(
    WaveShape.Noise,
    570,
    565,
    255,
    0,
    800,
    SoundExpressionEffect.None,
    InterpolationCurve.Linear
    ),
    music.createSoundEffect(
    WaveShape.Square,
    1910,
    631,
    255,
    0,
    162,
    SoundExpressionEffect.None,
    InterpolationCurve.Curve
    )
    ]
    music.play(SoundList[SoundID], music.PlaybackMode.InBackground)
}
function Create_item (Image2: Image, Name: string, Value: number, Item: number) {
    Item_sprite = sprites.create(Image2, SpriteKind.Item)
    sprites.setDataString(Item_sprite, "Name", Name)
    sprites.setDataNumber(Item_sprite, "Val", Value)
    sprites.setDataNumber(Item_sprite, "ID", Item)
    return Item_sprite
}
function BeginSetup () {
    TowardList = [
    0,
    1,
    2,
    -1
    ]
    dir_frame = 16
    DirToward = 4
    HalfDir = dir_frame / DirToward
    Udir = HalfDir * (DirToward / 2)
    LeaderBoardRankList = [
    "1st",
    "2nd",
    "3rd",
    "4th"
    ]
    PlayerIconList = [
    img`
        1 1 1 1 1 1 1 1 1 1 
        1 2 2 2 2 2 2 2 2 1 
        1 2 2 2 2 2 2 2 2 1 
        1 2 2 2 2 2 2 2 2 1 
        1 2 2 2 2 2 1 1 2 1 
        1 2 2 2 2 2 1 1 2 1 
        1 2 2 2 2 2 2 2 2 1 
        1 2 2 2 2 2 2 2 2 1 
        1 2 2 2 2 2 2 2 2 1 
        1 1 1 1 1 1 1 1 1 1 
        `,
    img`
        1 1 1 1 1 1 1 1 1 1 
        1 8 8 8 8 8 8 8 8 1 
        1 8 8 8 8 8 8 8 8 1 
        1 8 8 8 8 8 8 8 8 1 
        1 8 8 8 8 8 1 1 8 1 
        1 8 8 8 8 8 1 1 8 1 
        1 8 8 8 8 8 8 8 8 1 
        1 8 8 8 8 8 8 8 8 1 
        1 8 8 8 8 8 8 8 8 1 
        1 1 1 1 1 1 1 1 1 1 
        `,
    img`
        1 1 1 1 1 1 1 1 1 1 
        1 4 4 4 4 4 4 4 4 1 
        1 4 4 4 4 4 4 4 4 1 
        1 4 4 4 4 4 4 4 4 1 
        1 4 4 4 4 4 1 1 4 1 
        1 4 4 4 4 4 1 1 4 1 
        1 4 4 4 4 4 4 4 4 1 
        1 4 4 4 4 4 4 4 4 1 
        1 4 4 4 4 4 4 4 4 1 
        1 1 1 1 1 1 1 1 1 1 
        `,
    img`
        1 1 1 1 1 1 1 1 1 1 
        1 6 6 6 6 6 6 6 6 1 
        1 6 6 6 6 6 6 6 6 1 
        1 6 6 6 6 6 6 6 6 1 
        1 6 6 6 6 6 1 1 6 1 
        1 6 6 6 6 6 1 1 6 1 
        1 6 6 6 6 6 6 6 6 1 
        1 6 6 6 6 6 6 6 6 1 
        1 6 6 6 6 6 6 6 6 1 
        1 1 1 1 1 1 1 1 1 1 
        `
    ]
    LeaderBoardColorList = [
    4,
    9,
    14,
    12
    ]
    LeaderBoardList = []
    LeaderBoardList = []
    LocationPlaced = []
    ColorList = [
    2,
    8,
    4,
    6
    ]
    MovePin = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, 1]
    ]
    ColorFrameList = [
    img`
        . 2 2 2 2 . 
        2 2 f f 2 2 
        2 f f f f 2 
        2 f f f f 2 
        2 2 f f 2 2 
        . 2 2 2 2 . 
        `,
    img`
        . 8 8 8 8 . 
        8 8 f f 8 8 
        8 f f f f 8 
        8 f f f f 8 
        8 8 f f 8 8 
        . 8 8 8 8 . 
        `,
    img`
        . 5 5 5 5 . 
        5 5 f f 5 5 
        5 f f f f 5 
        5 f f f f 5 
        5 5 f f 5 5 
        . 5 5 5 5 . 
        `,
    img`
        . 7 7 7 7 . 
        7 7 f f 7 7 
        7 f f f f 7 
        7 f f f f 7 
        7 7 f f 7 7 
        . 7 7 7 7 . 
        `
    ]
    TileHole = [assets.tile`myTile`, assets.tile`myTile49`]
}
function Can_i_move_here (Asker: Sprite) {
    Player_location = Asker.tilemapLocation()
    if (sprites.readDataNumber(Asker, "Dir") == TowardList[0] && TileMapGridList[GetTiledAt(Player_location.column + 1, Player_location.row + 0)] < 0) {
        return false
    }
    if (sprites.readDataNumber(Asker, "Dir") == TowardList[1] && TileMapGridList[GetTiledAt(Player_location.column + 0, Player_location.row + 1)] < 0) {
        return false
    }
    if (sprites.readDataNumber(Asker, "Dir") == TowardList[2] && TileMapGridList[GetTiledAt(Player_location.column - 1, Player_location.row - 0)] < 0) {
        return false
    }
    if (sprites.readDataNumber(Asker, "Dir") == TowardList[3] && TileMapGridList[GetTiledAt(Player_location.column - 0, Player_location.row - 1)] < 0) {
        return false
    }
    return true
}
function SelectPlayersToStart () {
    if (!(OpenMenu)) {
        OpenMenu = true
        MenuSelect = CreateMenuSprite([
        miniMenu.createMenuItem("2players", assets.image`myImage3`),
        miniMenu.createMenuItem("3players", assets.image`myImage4`),
        miniMenu.createMenuItem("4players", assets.image`myImage5`)
        ], "DoYouHavePlayers?", [
        80,
        60,
        120,
        76
        ], img`
            . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . 
            . . 1 1 1 1 1 1 1 1 1 1 9 . . 
            . . 1 9 9 9 9 9 9 9 9 9 9 f . 
            . . 1 9 f f f f f f f 1 9 f f 
            . . 1 9 f 1 1 1 1 1 b 1 9 f f 
            . . 1 9 f 1 1 1 1 1 b 1 9 f f 
            . . 1 9 f 1 1 1 1 1 b 1 9 f f 
            . . 1 9 f 1 1 1 1 1 b 1 9 f f 
            . . 1 9 f 1 1 1 1 1 b 1 9 f f 
            . . 1 9 f b b b b b b 1 9 f f 
            . . 1 9 1 1 1 1 1 1 1 1 9 f f 
            . . 9 9 9 9 9 9 9 9 9 9 9 f f 
            . . . f f f f f f f f f f f f 
            . . . . f f f f f f f f f f f 
            `, 11, [2, 3, 4])
        blockObject.storeOnSprite(blockObject.getStoredObject(MenuSprite), MenuSelect)
        MenuSelect.onButtonPressed(controller.A, function (selection, selectedIndex) {
            MenuSelect.close()
            Max_player = blockObject.getNumberArrayProperty(MenuSelect, NumArrayProp.ResultVal)[selectedIndex]
            CurrentMaxPlayer = Max_player
            OpenMenu = false
            StartGame()
        })
    }
}
function RenderStatus (Width: number, SliceHight: number, HighlightControl: boolean) {
    Img = image.create(Width, scene.screenHeight())
    index = 0
    spriteutils.drawTransparentImage(image.screenImage(), Img, 0, 0)
    for (let value of sprites.allOfKind(SpriteKind.Player)) {
        Img.fillRect(0, index * SliceHight, Width, SliceHight, ColorList[sprites.readDataNumber(value, "P#")])
        Img.fillRect(0, (index + 1) * SliceHight - 1, Width, 1, 1)
        spriteutils.drawTransparentImage(scaling.createRotations(img`
            1 1 1 1 1 1 1 1 1 1 
            1 . . . . . . . . 1 
            1 . . . . . . . . 1 
            1 . . . . . . . . 1 
            1 . . . . . 1 1 . 1 
            1 . . . . . 1 1 . 1 
            1 . . . . . . . . 1 
            1 . . . . . . . . 1 
            1 . . . . . . . . 1 
            1 1 1 1 1 1 1 1 1 1 
            `, 4)[TowardList.indexOf(sprites.readDataNumber(value, "Dir"))], Img, Width - 16, index * SliceHight + (SliceHight / 2 - 9))
        index += 1
    }
    if (HighlightControl) {
        if (My_player) {
            Img.fillRect(0, scene.screenHeight() - 35, Width, 35, ColorList[sprites.readDataNumber(My_player, "P#")])
            if (Ready(My_player)) {
                for (let index = 0; index <= 3; index++) {
                    if (index == ((TowardList.indexOf(sprites.readDataNumber(My_player, "Dir")) - 1) % 4 + 2) % 4) {
                        if (Can_i_Utrun_here(My_player)) {
                            spriteutils.drawTransparentImage(scaling.createRotations(img`
                                ..............................
                                ..............................
                                ..............................
                                ............111111............
                                ...........1......1...........
                                ...........1......1...........
                                ...........1......1...........
                                ...........1......1...........
                                ...........1......1...........
                                ...........1......1...........
                                ...........1......1...........
                                ....1111111........1111111....
                                ...1......................1...
                                ...1..................11..1...
                                ...1.................1..1.1...
                                ...1.................1..1.1...
                                ...1..................11..1...
                                ...1......................1...
                                ....1111111........1111111....
                                ...........1......1...........
                                ...........1......1...........
                                ...........1......1...........
                                ...........1......1...........
                                ...........1......1...........
                                ...........1......1...........
                                ...........1......1...........
                                ............111111............
                                ..............................
                                ..............................
                                ..............................
                                `, 4)[index], Img, 0, scene.screenHeight() - 35)
                        }
                    } else {
                        if (index == sprites.readDataNumber(My_player, "Dir") - 1) {
                            if (Can_i_move_here(My_player)) {
                                spriteutils.drawTransparentImage(scaling.createRotations(img`
                                    ..............................
                                    ..............................
                                    ..............................
                                    ............111111............
                                    ...........1......1...........
                                    ...........1......1...........
                                    ...........1......1...........
                                    ...........1......1...........
                                    ...........1......1...........
                                    ...........1......1...........
                                    ...........1......1...........
                                    ....1111111........1111111....
                                    ...1......................1...
                                    ...1..................11..1...
                                    ...1.................1111.1...
                                    ...1.................1111.1...
                                    ...1..................11..1...
                                    ...1......................1...
                                    ....1111111........1111111....
                                    ...........1......1...........
                                    ...........1......1...........
                                    ...........1......1...........
                                    ...........1......1...........
                                    ...........1......1...........
                                    ...........1......1...........
                                    ...........1......1...........
                                    ............111111............
                                    ..............................
                                    ..............................
                                    ..............................
                                    `, 4)[index], Img, 0, scene.screenHeight() - 35)
                            }
                        } else {
                            if (TileMapGridList[GetTiledAt(My_player.tilemapLocation().column + MovePin[TowardList.indexOf(sprites.readDataNumber(My_player, "Dir"))][0], My_player.tilemapLocation().row + MovePin[TowardList.indexOf(sprites.readDataNumber(My_player, "Dir"))][1])] >= 0) {
                                spriteutils.drawTransparentImage(scaling.createRotations(img`
                                    ..............................
                                    ..............................
                                    ..............................
                                    ............111111............
                                    ...........1......1...........
                                    ...........1......1...........
                                    ...........1......1...........
                                    ...........1......1...........
                                    ...........1......1...........
                                    ...........1......1...........
                                    ...........1......1...........
                                    ....1111111........1111111....
                                    ...1......................1...
                                    ...1..................11..1...
                                    ...1.................1111.1...
                                    ...1.................1111.1...
                                    ...1..................11..1...
                                    ...1......................1...
                                    ....1111111........1111111....
                                    ...........1......1...........
                                    ...........1......1...........
                                    ...........1......1...........
                                    ...........1......1...........
                                    ...........1......1...........
                                    ...........1......1...........
                                    ...........1......1...........
                                    ............111111............
                                    ..............................
                                    ..............................
                                    ..............................
                                    `, 4)[index], Img, 0, scene.screenHeight() - 35)
                            }
                        }
                    }
                }
            }
            spriteutils.drawTransparentImage(scaling.createRotations(img`
                ..............................
                ..............................
                ..............................
                ............111111............
                ...........1......1...........
                ...........1......1...........
                ...........1......1...........
                ...........1......1...........
                ...........1......1...........
                ...........1......1...........
                ...........1......1...........
                ....1111111........11111111...
                ...1......................11..
                ...1......................111.
                ...1......................1111
                ...1......................1111
                ...1......................111.
                ...1......................11..
                ....1111111........11111111...
                ...........1......1...........
                ...........1......1...........
                ...........1......1...........
                ...........1......1...........
                ...........1......1...........
                ...........1......1...........
                ...........1......1...........
                ............111111............
                ..............................
                ..............................
                ..............................
                `, 4)[TowardList.indexOf(sprites.readDataNumber(My_player, "Dir"))], Img, 0, scene.screenHeight() - 35)
        }
        Img.fillRect(0, scene.screenHeight() - 35, Width, 1, 1)
    }
    Img.fillRect(Width - 1, 0, 1, scene.screenHeight(), 1)
    return Img
}
controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    if (Start) {
        GetMovement(TowardList[1], TowardList[3])
    }
})
function Get_stucked (Asker: Sprite) {
    Player_location = Asker.tilemapLocation()
    if (sprites.readDataNumber(Asker, "Dir") == TowardList[0]) {
        if (FindStucked([[1, 0], [0, -1], [0, 1]])) {
            return true
        }
    }
    if (sprites.readDataNumber(Asker, "Dir") == TowardList[1]) {
        if (FindStucked([[0, 1], [-1, 0], [1, 0]])) {
            return true
        }
    }
    if (sprites.readDataNumber(Asker, "Dir") == TowardList[2]) {
        if (FindStucked([[-1, 0], [0, -1], [0, 1]])) {
            return true
        }
    }
    if (sprites.readDataNumber(Asker, "Dir") == TowardList[3]) {
        if (FindStucked([[0, -1], [-1, 0], [1, 0]])) {
            return true
        }
    }
    return false
}
function Get_overlaps (Player: Sprite) {
    for (let value of sprites.allOfKind(SpriteKind.Player)) {
        if (Player.overlapsWith(value)) {
            return value
        }
    }
    return spriteutils.nullConsts(spriteutils.NullConsts.Undefined)
}
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    if (!(InGame)) {
        ResetGame(true)
    }
})
spriteutils.createRenderable(20, function (screen2) {
    if (!(InGame)) {
        screen2.fillRect(0, 0, scene.screenWidth(), scene.screenHeight(), 15)
        screen2.fillRect(0, scene.screenHeight() - 22, scene.screenWidth(), 1, 1)
        images.print(screen2, "A To Rematch", 62, scene.screenHeight() - 20, 1)
        images.print(screen2, "B To Restart", 62, scene.screenHeight() - 10, 1)
        if (My_player) {
            images.print(screen2, "Player" + convertToText(sprites.readDataNumber(My_player, "P#") + 1) + "WIN!", 70, 40, 1)
        }
        index = 0
        screen2.fillRect(0, 0, 60, scene.screenHeight(), 11)
        screen2.fillRect(60, 0, 1, scene.screenHeight(), 1)
        for (let value of LeaderBoardRankList) {
            if (index < LeaderBoardList.length) {
                Img = image.create(60, 20)
                Img.fill(LeaderBoardColorList[index])
                Img.drawRect(-1, -1, 62, 21, 1)
                spriteutils.drawTransparentImage(PlayerIconList[LeaderBoardList[index]], Img, 5, 5)
                images.print(Img, value, 16, 6, 1)
                spriteutils.drawTransparentImage(Img, screen2, 0, index * 20)
            }
            index += 1
        }
    }
})
function Generate_new_map (Width: number, Hight: number, OffsetCol: number, OffsetRow: number, Count: number, Max: number) {
    I = 0
    while (I <= Max) {
        for (let value of tiles.getTilesByType(assets.tile`myTile1`)) {
            tiles.setTileAt(value, assets.tile`myTile0`)
        }
        for (let value2 of tiles.getTilesByType(assets.tile`myTile0`)) {
            if (Math.percentChance(randint(50, 90))) {
                Tile_gen = randint(0, 3)
                if (Tile_gen == 0) {
                    if (value2.column < OffsetCol + Width) {
                        tiles.setTileAt(value2.getNeighboringLocation(CollisionDirection.Right), assets.tile`myTile1`)
                    }
                } else if (Tile_gen == 1) {
                    if (value2.row < OffsetRow + Hight) {
                        tiles.setTileAt(value2.getNeighboringLocation(CollisionDirection.Bottom), assets.tile`myTile1`)
                    }
                } else if (Tile_gen == 2) {
                    if (value2.column > OffsetCol) {
                        tiles.setTileAt(value2.getNeighboringLocation(CollisionDirection.Left), assets.tile`myTile1`)
                    }
                } else {
                    if (value2.row > OffsetRow) {
                        tiles.setTileAt(value2.getNeighboringLocation(CollisionDirection.Top), assets.tile`myTile1`)
                    }
                }
            }
        }
        I += 1
    }
    for (let value3 of tiles.getTilesByType(assets.tile`myTile1`)) {
        tiles.setTileAt(value3, assets.tile`myTile0`)
    }
    OffCol = OffsetCol - 1
    OffRow = OffsetRow - 1
    MapCol = Width + 3
    MapRow = Hight + 3
}
function TextSetup () {
    TextNameSprite = fancyText.create("Test", 72)
    fancyText.setFont(TextNameSprite, fancyText.geometric_serif_7)
    TextNameSprite.z = 1
    TextNameSprite.setFlag(SpriteFlag.RelativeToCamera, true)
}
spriteutils.createRenderable(1, function (screen2) {
    if (Start) {
        screen2.fillRect(0, 0, 72, scene.screenHeight(), 15)
        spriteutils.drawTransparentImage(RenderStatus(72, 20, true), screen2, 0, 0)
    }
})
function Get_player_on_tile (Col: number, Row: number) {
    for (let value of sprites.allOfKind(SpriteKind.Player)) {
        if (Col == value.tilemapLocation().column && Row == value.tilemapLocation().row) {
            return value
        }
    }
    return spriteutils.nullConsts(spriteutils.NullConsts.Undefined)
}
function StartGame () {
    select_maximum = false
    pause(100)
    tiles.loadMap(tiles.createSmallMap(tilemap`level4`))
    TileMapFrame = 0
    Generate_new_map(5, 9, 11, 2, 1, randint(12, 15))
    Action = false
    Player_rotation = []
    Hitbox_rotation = []
    Setup_item()
    for (let index = 0; index <= Max_player - 1; index++) {
        if (index == 0) {
            tiles.placeOnRandomTile(Create_player(assets.image`myImage0`, index, TowardList._pickRandom(), true), assets.tile`myTile0`)
        } else if (index == 1) {
            tiles.placeOnRandomTile(Create_player(assets.image`myImage1`, index, TowardList._pickRandom(), true), assets.tile`myTile0`)
        } else if (index == 2) {
            tiles.placeOnRandomTile(Create_player(assets.image`myImage2`, index, TowardList._pickRandom(), true), assets.tile`myTile0`)
        } else {
            tiles.placeOnRandomTile(Create_player(assets.image`myImage`, index, TowardList._pickRandom(), true), assets.tile`myTile0`)
        }
        PlacePlayerInSetup(10)
    }
    Ground_setup()
    Trun = randint(0, Max_player - 1)
    My_player = New_trun(Trun)
    My_player.sayText(convertToText(sprites.readDataNumber(My_player, "E")), 500, false)
    Playersprite = spriteutils.nullConsts(spriteutils.NullConsts.Undefined)
    TextSetup()
    TextUpdate()
    SetupListData()
    Start = true
}
function GetTiledAt (col: number, row: number) {
    gx = col - OffCol
    gy = row - OffRow
    gidx = gx
    gidx += gy * MapCol
    return gidx
}
function Ground_setup () {
    Setup_asset()
    for (let value3 of tiles.getTilesByType(assets.tile`myTile`)) {
        if (tiles.tileAtLocationEquals(value3.getNeighboringLocation(CollisionDirection.Top), assets.tile`myTile0`)) {
            tiles.setTileAt(value3, assets.tile`myTile49`)
        }
    }
    TileMapGridList = []
    for (let J = 0; J <= MapCol - 1; J++) {
        TileMapGridList.push(-1)
    }
    for (let I = 0; I <= MapRow - 3; I++) {
        TileMapGridList.push(-1)
        for (let J = 0; J <= MapCol - 3; J++) {
            if (tiles.tileAtLocationEquals(tiles.getTileLocation(OffCol + 1 + J, OffRow + 1 + I), assets.tile`myTile0`)) {
                TileMapGridList.push(0)
            } else if (tiles.tileAtLocationEquals(tiles.getTileLocation(OffCol + 1 + J, OffRow + 1 + I), assets.tile`myTile`)) {
                TileMapGridList.push(-1)
            } else if (tiles.tileAtLocationEquals(tiles.getTileLocation(OffCol + 1 + J, OffRow + 1 + I), assets.tile`myTile49`)) {
                TileMapGridList.push(-2)
            }
        }
        TileMapGridList.push(-1)
    }
    for (let J = 0; J <= MapCol - 1; J++) {
        if (tiles.tileAtLocationEquals(tiles.getTileLocation(OffCol + 1 + J, OffRow + (MapRow - 1)), assets.tile`myTile49`)) {
            TileMapGridList.push(-2)
        } else {
            TileMapGridList.push(-1)
        }
    }
    for (let value3 of tiles.getTilesByType(assets.tile`myTile0`)) {
        tiles.setTileAt(value3, assets.tile`myTile31`)
    }
    RenderTile()
    Render = true
}
function Setup_item () {
    for (let index2 = 0; index2 < randint(2, 5); index2++) {
        tiles.placeOnRandomTile(Create_item(assets.image`myImage6`, "A", 1, 0), assets.tile`myTile0`)
        Check_overlap_in_setup(5)
    }
    for (let index2 = 0; index2 < randint(2, 5); index2++) {
        tiles.placeOnRandomTile(Create_item(assets.image`myImage7`, "H", 1, 1), assets.tile`myTile0`)
        Check_overlap_in_setup(5)
    }
    for (let index2 = 0; index2 < randint(2, 5); index2++) {
        tiles.placeOnRandomTile(Create_item(assets.image`myImage8`, "E", 2, 2), assets.tile`myTile0`)
        Check_overlap_in_setup(5)
    }
}
controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    if (Start) {
        GetMovement(TowardList[3], TowardList[1])
    }
})
function FindStucked (DxDyTemp: number[][]) {
    Count = 0
    for (let value of DxDyTemp) {
        if (TileMapGridList[GetTiledAt(Player_location.column + value[0], Player_location.row + value[1])] < 0) {
            Count += 1
        }
    }
    if (Count >= DxDyTemp.length) {
        return true
    }
    return false
}
function Can_i_Utrun_here (Asker: Sprite) {
    if (sprites.readDataNumber(Asker, "E") == Max_energy) {
        return true
    }
    return false
}
function AddPlayerDataTable () {
    GridListData = []
    GridListData.push(sprites.readDataNumber(Playersprite, "P#"))
    GridListData.push(sprites.readDataNumber(Playersprite, "Dir"))
    GridListData.push(sprites.readDataNumber(Playersprite, "H"))
}
function TrunToward (Player: Sprite) {
    if (sprites.readDataNumber(Player, "Di") != sprites.readDataNumber(Player, "Dir") * HalfDir) {
        if (Math.abs(sprites.readDataNumber(Player, "Deg")) > 0) {
            sprites.changeDataNumberBy(Player, "Di", sprites.readDataNumber(Player, "Deg"))
            sprites.setDataNumber(Player, "Di", CheckSumOfDirection(sprites.readDataNumber(Player, "Di")))
        }
    }
}
controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    if (Start) {
        GetMovement(TowardList[0], TowardList[2])
    }
})
controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    if (Start) {
        GetMovement(TowardList[2], TowardList[0])
    }
})
function Get_re_player_ID () {
    index = 0
    for (let value of sprites.allOfKind(SpriteKind.Player)) {
        sprites.setDataNumber(value, "Player", index)
        sprites.setDataNumber(sprites.readDataSprite(value, "Hitbox"), "Player", index)
        index += 1
    }
    Max_player += -1
    Trun = Trun % Max_player
    My_player = New_trun(Trun)
}
function PlayerspriteTick () {
    if (My_player) {
        if (Playersprite == My_player) {
            Playersprite = spriteutils.nullConsts(spriteutils.NullConsts.Undefined)
        }
        if (Playersprite) {
            if (!(Action)) {
                Get_player_acttacked(sprites.readDataNumber(My_player, "Dir"), Get_touching_on(My_player) != spriteutils.nullConsts(spriteutils.NullConsts.Undefined), sprites.readDataNumber(My_player, "A"), Playersprite)
                PlaySoundEffect(2)
                scene.cameraShake(4, 500)
                Action = true
            }
            if (Ready(Playersprite)) {
                tiles.placeOnTile(Playersprite, Playersprite.tilemapLocation())
                if (sprites.readDataNumber(Playersprite, "H") <= 0 || TileMapGridList[GetTiledAt(Playersprite.tilemapLocation().column, Playersprite.tilemapLocation().row)] < 0) {
                    sprites.setDataBoolean(My_player, "Perfect", true)
                    sprites.destroy(Playersprite, effects.fire, 500)
                    sprites.destroy(sprites.readDataSprite(Playersprite, "Hitbox"))
                    Get_re_player_ID()
                    PlaySoundEffect(3)
                }
                sprites.setDataBoolean(My_player, "HasPlay", true)
                Action = false
                timer.after(50, function () {
                    Playersprite = spriteutils.nullConsts(spriteutils.NullConsts.Undefined)
                    My_player = spriteutils.nullConsts(spriteutils.NullConsts.Undefined)
                })
            }
        }
    }
}
function SetupListData () {
    AddItemGridData()
    AddPlayerGridData()
    ListTable = [ItemGridList, PlayerGridList]
}
let GridListData: number[] = []
let Count = 0
let gy = 0
let gx = 0
let Hitbox_rotation: number[] = []
let TileMapFrame = 0
let Tile_gen = 0
let I = 0
let Img: Image = null
let MenuSelect: miniMenu.MenuSprite = null
let ColorFrameList: Image[] = []
let MovePin: number[][] = []
let PlayerIconList: Image[] = []
let LeaderBoardRankList: string[] = []
let SoundList: music.SoundEffect[] = []
let TileHole: Image[] = []
let EdgeTile = 0
let Max_energy = 0
let WinIntro = false
let LeaderBoardColorList: number[] = []
let PlacingPlayer: undefined = null
let PlayerData: number[] = []
let LeaderBoardList: number[] = []
let Player_location: tiles.Location = null
let MenuSprite: miniMenu.MenuSprite = null
let GetPlayed = false
let Action = false
let Recipe = ""
let TileGP = 0
let Tile = 0
let MapGroup: number[] = []
let MapRecipe: string[] = []
let Map_asset: Image[] = []
let TextNameSprite: fancyText.TextSprite = null
let ColorList: number[] = []
let Colour = 0
let Str = ""
let DirToward = 0
let TowardList: number[] = []
let index = 0
let Trun = 0
let Udir = 0
let My_player: undefined = null
let LocationPlaced: tiles.Location[] = []
let PlacingItem: Sprite = null
let OpenMenu = false
let select_maximum = false
let Max_player = 0
let CurrentMaxPlayer = 0
let Render = false
let InGame = false
let Start = false
let dir_frame = 0
let Player_rotation: Image[][] = []
let HalfDir = 0
let ListTable: number[][] = []
let Playersprite: undefined = null
let PlayerGridList: number[] = []
let Item_sprite: Sprite = null
let TileMapGridList: number[] = []
let gidx = 0
let OffCol = 0
let Acol = 0
let OffRow = 0
let Arow = 0
let MapCol = 0
let MapRow = 0
let ItemGridList: number[] = []
ResetGame(true)
game.onUpdateInterval(100, function () {
    TickDir()
})
game.onUpdate(function () {
    if (My_player) {
        if (sprites.readDataBoolean(My_player, "AI")) {
        	
        }
    }
})
game.onUpdate(function () {
    if (InGame) {
        if (!(Start)) {
            if (TextNameSprite) {
                sprites.destroy(TextNameSprite)
            }
        }
        if (TextNameSprite) {
            TextStateUpdate()
        }
    }
})
game.onUpdate(function () {
    if (InGame) {
        if (Start) {
            SetCostume()
            MyPlayerInTrunIs()
            MyPlayerTick()
            PlayerspriteTick()
        }
    }
})
game.onUpdate(function () {
    UpdateListData()
})
